import { createClient } from '@/utils/supabase/client';
const supabase = createClient();

export const ProductService = {
    // Función privada para manejar la subida de imágenes (reutilizable)
    async _uploadImage(file) {
        const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const filePath = `productos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    },

    /**
     * CREAR PRODUCTO
     */
    async create(formData, imageFile) {
        let foto_producto_url = '';
        if (imageFile) {
            foto_producto_url = await this._uploadImage(imageFile);
        }

        const { data, error } = await supabase
            .from('productos')
            .insert([{
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio_contado: parseFloat(formData.precio_contado),
                precio_credito: parseFloat(formData.precio_credito),
                stock: parseInt(formData.stock),
                categoria: formData.categoria,
                foto_producto_url: foto_producto_url
            }])
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * ACTUALIZAR PRODUCTO
     */
    async update(id, formData, imageFile) {
        let final_image_url = formData.foto_producto_url;

        if (imageFile) {
            // Eliminar antigua si existe
            if (formData.foto_producto_url) {
                const oldPath = formData.foto_producto_url.split('/product-images/')[1];
                if (oldPath) await supabase.storage.from('product-images').remove([oldPath]);
            }
            final_image_url = await this._uploadImage(imageFile);
        }

        const { data, error } = await supabase
            .from('productos')
            .update({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio_contado: parseFloat(formData.precio_contado),
                precio_credito: parseFloat(formData.precio_credito),
                stock: parseInt(formData.stock),
                categoria: formData.categoria,
                foto_producto_url: final_image_url,
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    },


    /**
     * RPC para descontar stock de forma segura
     */
    async deductStock(productId, quantity) {
        const { data, error } = await supabase
            .rpc('descontar_stock', { // Nombre del RPC en español
                producto_id: productId, 
                cantidad: quantity 
            });

        if (error) throw error;
        return data;
    }
};