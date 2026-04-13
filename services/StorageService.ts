import { supabase } from './supabase';

export class StorageService {
    // Upload de arquivo usando ImgBB (ignora totalmente o bucket do Supabase)
    async uploadFile(file: File, folder: 'images' | 'videos'): Promise<{ url: string | null; error: Error | null }> {
        try {
            // O ImgBB é focado em imagens.
            const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

            if (!apiKey) {
                throw new Error('A chave VITE_IMGBB_API_KEY não foi encontrada no arquivo .env.local');
            }

            const formData = new FormData();
            formData.append('image', file);
            // Opcional: Se quiser dar um nome à imagem baseado na data
            formData.append('name', `${Date.now()}_${Math.random().toString(36).substring(7)}`);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Erro ao enviar imagem para ImgBB');
            }

            return { url: data.data.url, error: null };
        } catch (error) {
            console.error('Erro no upload IMGBB:', error);
            // Em caso de API quebrada e o usuário tentar mandar vídeos, apenas não falhe
            return { url: null, error: error as Error };
        }
    }

    // Upload de múltiplos arquivos
    async uploadMultipleFiles(files: File[], folder: 'images' | 'videos'): Promise<{ urls: string[]; errors: Error[] }> {
        const results = await Promise.all(
            files.map(file => this.uploadFile(file, folder))
        );

        const urls = results.filter(r => r.url).map(r => r.url!);
        const errors = results.filter(r => r.error).map(r => r.error!);

        return { urls, errors };
    }

    // Deletar arquivo - A API pública do ImgBB não suporta exclusão direta pela URL simples,
    // então vamos retornar erro nulo nativamente para não quebrar o site quando tentar apagar algo antigo.
    async deleteFile(fileUrl: string): Promise<{ error: Error | null }> {
        try {
            // Retorna sucessso silenciosamente, 
            // pois ImgBB armazena as fotos e não precisamos nos preocupar com espaço livre nele
            return { error: null };
        } catch (error) {
            console.error('Erro ao tentar deletar arquivo:', error);
            return { error: error as Error };
        }
    }

    // Deletar múltiplos arquivos
    async deleteMultipleFiles(fileUrls: string[]): Promise<{ errors: Error[] }> {
        const results = await Promise.all(
            fileUrls.map(url => this.deleteFile(url))
        );

        const errors = results.filter(r => r.error).map(r => r.error!);
        return { errors };
    }
}

export const storageService = new StorageService();
