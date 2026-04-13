import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const ClientService = {


    // Versión Admin: Ve todos los clientes del sistema
    async getAllForAdmin() {
        const { data, error } = await supabase
            .from('clientes')
            .select(` *, vendedor:vendedor_id (nombre_completo)`)
            .order('fecha_registro', { ascending: false });

        if (error) {
            console.error('errpr en supabase', error);
            throw error;
        }
        return data;
    },

    // Versión Vendedor: Solo ve sus clientes asignados
    async getMyClients() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No hay sesión activa");

        const { data, error } = await supabase
            .from('clientes')
            .select('id, razon_social, rif, status, encargado, foto_fachada_url, foto_rif_url ')
            .eq('vendedor_id', user.id)
            .order('razon_social', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select(`
            *,
            vendedor:vendedor_id (id, nombre_completo)
        `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * ACCIONES (WRITE/UPDATE)
     */

    async create(clientData, files) {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Lógica de archivos aislada y segura
        const upload = async (file, folder) => {
            const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
            const path = `${folder}/${fileName}`;

            // bucket en Supabase: 'fotos-clientes'            
            const { error: upErr } = await supabase.storage
                .from('client-documents')
                .upload(path, file);

            if (upErr) throw upErr;
            return supabase.storage.from('client-documents').getPublicUrl(path).data.publicUrl;
        };

        try {
            const [rifUrl, fachadaUrl] = await Promise.all([
                files.rif ? upload(files.rif, 'rif') : Promise.resolve(''),
                files.fachada ? upload(files.fachada, 'fachadas') : Promise.resolve('')
            ]);

            // 2. Inserción limpia
            const { data, error } = await supabase
                .from('clientes')
                .insert([{
                    razon_social: clientData.razon_social,
                    rif: clientData.rif,
                    encargado: clientData.encargado,
                    telefono: clientData.telefono,
                    email: clientData.email,
                    direccion: clientData.direccion,
                    foto_rif_url: rifUrl,
                    foto_fachada_url: fachadaUrl,
                    status: 'pendiente',
                    vendedor_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw err;
        }
    },

    async updateStatus(id, newStatus, adminId) {
        const { data, error } = await supabase
            .from('clientes')
            .update({
                status: newStatus,
                aprobado_por: newStatus === 'habilitado' ? adminId : null,
                fecha_aprobacion: newStatus === 'habilitado' ? new Date().toISOString() : null
            })
            .eq('id', id)
            .select()
            .maybeSingle()
            

        if (error) throw error;
        return data;
    },

    async update(id, updateData) {
        const { error } = await supabase
            .from('clientes')
            .update(updateData)
            .eq('id', id);
        if (error) throw error;
    }
};
