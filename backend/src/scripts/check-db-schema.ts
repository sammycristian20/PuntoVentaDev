import 'dotenv/config';
import { SupabaseConfig } from '../config/supabase.config';

async function checkDatabaseSchema() {
  try {
    const supabaseConfig = new SupabaseConfig();
    const supabase = supabaseConfig.createClient();

    // Consultar todas las tablas públicas usando SQL nativo
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info', {
        schema_name: 'public'
      });

    if (tablesError) {
      console.error('Error al consultar las tablas:', tablesError.message);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('No se encontraron tablas en el esquema público.');
      return;
    }

    console.log('\nTablas encontradas en la base de datos:');
    console.log('=====================================');

    // Iterar sobre cada tabla para obtener sus columnas
    for (const table of tables) {
      console.log(`\nTabla: ${table.table_name}`);
      console.log('-----------------');

      const { data: columns, error: columnsError } = await supabase
        .rpc('get_columns_info', {
          table_name: table.table_name,
          schema_name: 'public'
        });

      if (columnsError) {
        console.error(`Error al consultar las columnas de ${table.tablename}:`, columnsError.message);
        continue;
      }

      if (columns) {
        console.log('Columnas:');
        columns.forEach(column => {
          console.log(`- ${column.column_name}`);
          console.log(`  Tipo: ${column.data_type}`);
          console.log(`  Nullable: ${column.is_nullable}`);
        });
      }
    }

  } catch (error) {
    console.error('Error al verificar el esquema de la base de datos:', error);
  }
}

// Ejecutar la función
checkDatabaseSchema();