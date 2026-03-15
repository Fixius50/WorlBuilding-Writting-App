import { sql } from '../database/db';

/**
 * SHIM: Puente de compatibilidad para emular comandos 'invoke' (tipo Tauri)
 * redirigiéndolos a la base de datos local SQLocal.
 */
export async function invoke(command, args = {}) {
    console.log(`[Bridge] Invoking command: ${command}`, args);

    switch (command) {
        // --- PROYECTOS ---
        case 'get_proyectos':
            return await sql`SELECT * FROM proyectos ORDER BY ultima_modificacion DESC`;
        
        case 'get_proyecto_by_name':
            const [proyecto] = await sql`SELECT * FROM proyectos WHERE nombre = ${args.name} LIMIT 1`;
            return proyecto;

        case 'create_proyecto':
            const { name, title, tag, imageUrl } = args;
            const initials = name.substring(0, 2).toUpperCase();
            const resultProj = await sql`
                INSERT INTO proyectos (nombre, descripcion, tag, image_url, initials)
                VALUES (${name}, ${title}, ${tag}, ${imageUrl}, ${initials})
                RETURNING *
            `;
            return resultProj[0];

        // --- CARPETAS (WORLD BIBLE) ---
        case 'get_carpetas':
            // En el esquema actual, project_id es el nombre del proyecto (slug) por simplicidad en el frontend
            // pero en DB es INTEGER. Buscamos por el nombre del proyecto si es necesario.
            return await sql`
                SELECT * FROM carpetas 
                WHERE project_id = (SELECT id FROM proyectos WHERE nombre = ${args.projectId})
                OR project_id = ${args.projectId}
                ORDER BY nombre ASC
            `;

        case 'create_carpeta':
            const slug = args.nombre.toLowerCase().replace(/\s+/g, '-');
            const resultCarp = await sql`
                INSERT INTO carpetas (nombre, project_id, padre_id, tipo, slug)
                VALUES (${args.nombre}, ${args.projectId}, ${args.padreId}, ${args.tipo || 'FOLDER'}, ${slug})
                RETURNING *
            `;
            return resultCarp[0];

        case 'update_carpeta':
            await sql`UPDATE carpetas SET nombre = ${args.nombre} WHERE id = ${args.id}`;
            return { success: true };

        case 'delete_carpeta':
            await sql`DELETE FROM carpetas WHERE id = ${args.id}`;
            return { success: true };

        // --- ENTIDADES ---
        case 'get_entidades':
            return await sql`
                SELECT * FROM entidades 
                WHERE (project_id = (SELECT id FROM proyectos WHERE nombre = ${args.projectId}) OR project_id = ${args.projectId})
                AND tipo = ${args.tipoEntidad}
            `;

        case 'get_entidad_by_id':
            const [entidad] = await sql`SELECT * FROM entidades WHERE id = ${args.id} LIMIT 1`;
            return entidad;

        case 'create_entidad':
            const resultEnt = await sql`
                INSERT INTO entidades (nombre, tipo, descripcion, project_id, carpeta_id)
                VALUES (${args.name}, ${args.tipoEntidad}, ${args.description || ''}, ${args.projectId}, ${args.carpetaId})
                RETURNING *
            `;
            return resultEnt[0];

        case 'delete_entidad':
            await sql`DELETE FROM entidades WHERE id = ${args.id}`;
            return { success: true };

        // --- TIMELINE / EVENTOS ---
        case 'get_eventos':
            return await sql`
                SELECT * FROM eventos 
                WHERE (project_id = (SELECT id FROM proyectos WHERE nombre = ${args.projectId}) OR project_id = ${args.projectId})
            `;

        case 'create_evento':
            const resultEv = await sql`
                INSERT INTO eventos (titulo, descripcion, fecha_simulada, project_id)
                VALUES (${args.title}, ${args.description}, ${args.startDate}, ${args.projectId})
                RETURNING *
            `;
            return resultEv[0];

        default:
            console.warn(`[Bridge] Command not implemented: ${command}`);
            return null;
    }
}
