import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const ClientService = {
    /**
     * LECTURA DE DATOS
     */

    async getAllForAdmin() {
        const { data, error } = await supabase
            .from('clientes')
            .select(`*, vendedor:vendedor_id (nombre_completo)`)
            .order('fecha_registro', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getMyClients() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No hay sesión activa");

        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('vendedor_id', user.id)
            .order('razon_social', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * ESCRITURA Y ARCHIVOS
     */

    // Función interna para subir archivos
    async _uploadDocument(file, folder, userId) {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const path = `${folder}/${fileName}`;

        const { error: upErr } = await supabase.storage
            .from('client-documents')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (upErr) {
            console.error(`Error subiendo ${folder}:`, upErr);
            throw upErr;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('client-documents')
            .getPublicUrl(path);

        return publicUrl;
    },

    /**
     * Autoregistro mediante RPC (Para saltar RLS)
     */
    async completeSelfRegistration(userId, metadataParaSupabase, files) {
        try {
            if (!metadataParaSupabase) throw new Error("Datos del formulario no recibidos");
            if (!files) throw new Error("No se recibieron los archivos");

            // 1. Subir archivos y obtener URLs en paralelo
            const [rifUrl, fachadaUrl] = await Promise.all([
                this._uploadDocument(files.rif, 'rif', userId),
                this._uploadDocument(files.fachada, 'fachadas', userId)
            ]);

            console.log("📸 URLs obtenidas:", { rifUrl, fachadaUrl, user: userId });

            // 2. Llamamos al RPC (Asegúrate de haber creado la función en el SQL de Supabase)
            // Esto actualiza la tabla 'clientes' ignorando restricciones de RLS
            const { data, error: rpcError } = await supabase.rpc('vincular_fotos_cliente', {
                p_user_id: userId,
                p_rif_url: rifUrl,
                p_fachada_url: fachadaUrl
            });

            if (rpcError) throw rpcError;

            // 3. Opcional: Si quieres actualizar otros campos de texto que el Trigger no haya captado
            // pero el RPC ya debería haber marcado el status como 'pendiente'.
            return { success: true, data };

        } catch (err) {
            console.error("Error crítico en completeSelfRegistration:", err);
            throw err;
        }
    },

    /**
     * ACTUALIZACIONES (Admin/Vendedor)
     */

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
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async reassignVendedor(clientId, newVendedorId) {
        const { error } = await supabase
            .from('clientes')
            .update({ vendedor_id: newVendedorId })
            .eq('id', clientId);

        if (error) throw error;
    }
};