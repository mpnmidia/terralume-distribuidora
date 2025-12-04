import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET_NAME = 'produtos_terra_lume';
const COMPANY_ID = '6d6212b8-3ff2-4510-8572-04e1399f8534';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as unknown as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo (file) é obrigatório' },
        { status: 400 }
      );
    }

    // Detecta tipo corretamente
    const contentType = file.type || 'image/jpeg';

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Gera SKU único
    const { data: skuData, error: skuError } = await supabaseAdmin.rpc('generate_sku');

    if (skuError || !skuData) {
      console.error(skuError);
      return NextResponse.json(
        { error: 'Falha ao gerar SKU automático' },
        { status: 500 }
      );
    }

    const sku = skuData;

    // Determina extensão
    const ext =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
        ? 'webp'
        : 'jpg';

    const filePath = `${sku}.${ext}`;
    const buffer = Buffer.from(arrayBuffer);

    // Upload seguro
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: 'Falha ao enviar arquivo para o bucket', details: uploadError.message },
        { status: 500 }
      );
    }

    const publicUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
      `/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

    // Inserção / atualização de produto
    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(
        {
          sku,
          company_id: COMPANY_ID,
          image_url: publicUrl,
          name: null,
          category: null,
          unit: null,
          unit_price: 0,
          promo_price: 0,
          offer_is_active: false,
        },
        { onConflict: 'sku,company_id' } // ORDEM CORRETA
      );

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.json(
        { error: 'Falha ao registrar produto', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sku,
      imageUrl: publicUrl,
    });
  } catch (err: any) {
    console.error('Erro inesperado upload-product-image-auto:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar upload', details: err?.message },
      { status: 500 }
    );
  }
}
