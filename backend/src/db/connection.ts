import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Simple JSON-based storage for development
// In production, use environment variable or default to data directory
// IMPORTANT: On Render.com, the file system is ephemeral, so we need to use a persistent location
// For production, we'll use the /tmp directory which persists across deploys on Render.com
const dbPath = process.env.DATABASE_PATH || 
  (process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'ekomobil-db.json')  // Use /tmp for Render.com persistence
    : path.join(__dirname, '../../data/db.json'));

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface Database {
  integrators: any[];
  categories: any[];
  brands: any[];
  brand_offers: any[];
  category_offers: any[];
  event_definitions: any[];
  campaigns: any[];
  announcements: any[];
}

let db: Database = {
  integrators: [],
  categories: [],
  brands: [],
  brand_offers: [],
  category_offers: [],
  event_definitions: [],
  campaigns: [],
  announcements: [],
};

// Load database from file
function loadDB() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(data);
    } catch (error) {
      console.error('Error loading database:', error);
    }
  }
}

// Save database to file
function saveDB() {
  try {
    // Ensure directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    // Also save a backup copy
    if (process.env.NODE_ENV === 'production') {
      const backupPath = path.join(path.dirname(dbPath), 'ekomobil-db-backup.json');
      fs.writeFileSync(backupPath, JSON.stringify(db, null, 2));
    }
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize
loadDB();

// Convert PostgreSQL-style parameters ($1, $2) to array indices
function convertParams(sql: string, params?: any[]): { sql: string; params: any[] } {
  if (!params || params.length === 0) {
    return { sql, params: [] };
  }

  let convertedSql = sql;
  const convertedParams: any[] = [];
  let paramIndex = 1;

  convertedSql = convertedSql.replace(/\$(\d+)/g, () => {
    const index = paramIndex - 1;
    if (index < params.length) {
      convertedParams.push(params[index]);
    }
    paramIndex++;
    return '?';
  });

  convertedSql = convertedSql.replace(/ILIKE/gi, 'LIKE');

  return { sql: convertedSql, params: convertedParams };
}

// Simple query executor
export const query = async (text: string, params?: any[]): Promise<any> => {
  try {
    const { sql, params: processedParams } = convertParams(text, params);
    const upperSql = sql.trim().toUpperCase();

    // Handle SELECT queries
    if (upperSql.startsWith('SELECT')) {
      let tableName = '';
      if (sql.match(/FROM (\w+)/i)) {
        tableName = sql.match(/FROM (\w+)/i)![1];
      }

      if (!tableName || !(tableName in db)) {
        return { rows: [], rowCount: 0 };
      }

      let rows = [...(db as any)[tableName]];

      // Simple WHERE clause handling
      if (sql.includes('WHERE')) {
        const whereMatch = sql.match(/WHERE (.+?)(?: ORDER|$)/i);
        if (whereMatch) {
          const whereClause = whereMatch[1];
          
          // Handle simple equality
          if (whereClause.includes('=')) {
            const [key, value] = whereClause.split('=').map(s => s.trim());
            const paramIndex = parseInt(value.replace('?', '')) - 1;
            if (paramIndex >= 0 && paramIndex < processedParams.length) {
              const filterValue = processedParams[paramIndex];
              rows = rows.filter((row: any) => {
                const rowValue = row[key.replace(/[^a-z_]/gi, '')];
                return rowValue == filterValue;
              });
            }
          }
          
          // Handle LIKE
          if (whereClause.includes('LIKE')) {
            const [key, pattern] = whereClause.split('LIKE').map(s => s.trim());
            const paramIndex = parseInt(pattern.replace('?', '').replace(/%/g, '')) - 1;
            if (paramIndex >= 0 && paramIndex < processedParams.length) {
              const filterValue = processedParams[paramIndex].replace(/%/g, '');
              rows = rows.filter((row: any) => {
                const rowValue = String(row[key.replace(/[^a-z_]/gi, '')] || '').toLowerCase();
                return rowValue.includes(filterValue.toLowerCase());
              });
            }
          }
        }
      }

      // Handle JOINs
      if (sql.includes('JOIN')) {
        // Handle both LEFT JOIN and regular JOIN
        const joinMatch = sql.match(/(?:LEFT\s+)?JOIN\s+(\w+)\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
        if (joinMatch) {
          const [, joinTable, joinAlias, leftTable, leftKey, rightTable, rightKey] = joinMatch;
          const joinData = (db as any)[joinTable] || [];
          
          rows = rows.map((row: any) => {
            // Find matching row in join table
            const joinRow = joinData.find((j: any) => {
              const leftValue = row[leftKey];
              const rightValue = j[rightKey];
              return leftValue == rightValue; // Use == for type coercion
            });
            
            // Add joined fields - extract all SELECT aliases
            const result: any = { ...row };
            if (joinRow) {
              // Extract all SELECT aliases from the query
              const selectMatches = sql.matchAll(/(\w+)\.(\w+)\s+as\s+(\w+)/gi);
              for (const match of selectMatches) {
                const [, tableAlias, fieldName, aliasName] = match;
                if (tableAlias === joinAlias && joinRow[fieldName] !== undefined) {
                  result[aliasName] = joinRow[fieldName];
                }
              }
              
              // Also add default name field if no alias found
              if (!result[`${joinAlias}_name`] && joinRow['name']) {
                result[`${joinAlias}_name`] = joinRow['name'];
              }
            } else {
              // Extract aliases and set to null
              const selectMatches = sql.matchAll(/(\w+)\.(\w+)\s+as\s+(\w+)/gi);
              for (const match of selectMatches) {
                const [, tableAlias, , aliasName] = match;
                if (tableAlias === joinAlias) {
                  result[aliasName] = null;
                }
              }
            }
            return result;
          });
        }
      }

      // Handle ORDER BY
      if (sql.includes('ORDER BY')) {
        const orderMatch = sql.match(/ORDER BY (.+?)(?: (ASC|DESC))?/i);
        if (orderMatch) {
          const orderKey = orderMatch[1].trim().replace(/^(\w+)\./, '');
          const direction = orderMatch[2]?.toUpperCase() || 'ASC';
          rows.sort((a: any, b: any) => {
            const aVal = a[orderKey] || '';
            const bVal = b[orderKey] || '';
            if (direction === 'DESC') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }
      }

      // Convert boolean integers back to booleans
      const processedRows = rows.map((row: any) => {
        const processed: any = {};
        for (const [key, value] of Object.entries(row)) {
          if (key.includes('is_') || key.includes('_active') || key.includes('_best')) {
            processed[key] = value === 1 || value === true;
          } else if (key.includes('platforms') || key.includes('target_platforms')) {
            try {
              processed[key] = typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
              processed[key] = Array.isArray(value) ? value : [value];
            }
          } else {
            processed[key] = value;
          }
        }
        return processed;
      });

      return { rows: processedRows, rowCount: processedRows.length };
    }

    // Handle INSERT
    if (upperSql.startsWith('INSERT')) {
      const tableMatch = sql.match(/INSERT INTO (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (tableName in db) {
          const columnsMatch = sql.match(/\((.+?)\)/);
          const valuesMatch = sql.match(/VALUES \((.+?)\)/);
          
          if (columnsMatch && valuesMatch) {
            const columns = columnsMatch[1].split(',').map(c => c.trim());
            const newRow: any = {};
            
            // Auto-increment ID first
            const existing = (db as any)[tableName];
            newRow.id = existing.length > 0 ? Math.max(...existing.map((r: any) => r.id || 0)) + 1 : 1;
            
            columns.forEach((col, index) => {
              let value = processedParams[index];
              if (value === null || value === undefined) {
                newRow[col] = null;
                return;
              }
              if (Array.isArray(value)) {
                value = JSON.stringify(value);
              }
              if (typeof value === 'boolean') {
                value = value ? 1 : 0;
              }
              newRow[col] = value;
            });

            // Set timestamps if not provided
            if (!newRow.created_at) {
              newRow.created_at = new Date().toISOString();
            }
            if (!newRow.updated_at) {
              newRow.updated_at = new Date().toISOString();
            }

            (db as any)[tableName].push(newRow);
            saveDB();

            // Handle RETURNING
            if (sql.includes('RETURNING')) {
              return { rows: [newRow], rowCount: 1, lastInsertRowid: newRow.id };
            }
            return { rows: [], rowCount: 1, lastInsertRowid: newRow.id };
          }
        }
      }
    }

    // Handle UPDATE
    if (upperSql.startsWith('UPDATE')) {
      const tableMatch = sql.match(/UPDATE (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const whereMatch = sql.match(/WHERE (.+?)(?: RETURNING|$)/i);
        
        if (whereMatch) {
          const whereClause = whereMatch[1];
          const idMatch = whereClause.match(/id = \?/);
          if (idMatch && processedParams.length > 0) {
            const id = processedParams[processedParams.length - 1];
            const table = (db as any)[tableName];
            const index = table.findIndex((r: any) => r.id == id);
            
            if (index !== -1) {
              const setMatch = sql.match(/SET (.+?) WHERE/i);
              if (setMatch) {
                const setClause = setMatch[1];
                const updates = setClause.split(',').map(s => s.trim());
                
                updates.forEach((update, idx) => {
                  const [key] = update.split('=').map(s => s.trim());
                  if (processedParams[idx] !== undefined) {
                    let value = processedParams[idx];
                    if (Array.isArray(value)) {
                      value = JSON.stringify(value);
                    }
                    if (typeof value === 'boolean') {
                      value = value ? 1 : 0;
                    }
                    table[index][key] = value;
                  }
                });
                
                table[index].updated_at = new Date().toISOString();
                saveDB();

                if (sql.includes('RETURNING')) {
                  return { rows: [table[index]], rowCount: 1 };
                }
                return { rows: [], rowCount: 1 };
              }
            }
          }
        }
      }
    }

    // Handle DELETE
    if (upperSql.startsWith('DELETE')) {
      const tableMatch = sql.match(/FROM (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const whereMatch = sql.match(/WHERE (.+?)(?: RETURNING|$)/i);
        
        if (whereMatch) {
          const whereClause = whereMatch[1];
          const idMatch = whereClause.match(/id = \?/);
          if (idMatch && processedParams.length > 0) {
            const id = processedParams[0];
            const table = (db as any)[tableName];
            const index = table.findIndex((r: any) => r.id == id);
            
            if (index !== -1) {
              const deleted = table.splice(index, 1)[0];
              saveDB();
              return { rows: [deleted], rowCount: 1 };
            }
          }
        }
      }
    }

    return { rows: [], rowCount: 0 };
  } catch (error) {
    console.error('Database query error', error);
    console.error('SQL:', text);
    throw error;
  }
};

export { db, saveDB, loadDB };
