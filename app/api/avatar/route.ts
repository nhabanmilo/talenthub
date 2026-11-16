import { requireUser, csrf, files, check, error, response, one } from '@/lib/server';
import { safeGooglePicture } from '@/lib/google';
export const dynamic = 'force-dynamic';
const key = (id: string) => `avatars/${id}/profile`;
export async function GET(req: Request) {
  try {
    const u = await requireUser(req);
    const image = await files()?.get(key(u.id));
    if (!image) {
      const identity = await one('SELECT picture FROM google_identities WHERE user_id=?',u.id);
      const picture = safeGooglePicture(identity?.picture);
      if(picture) return new Response(null,{status:302,headers:{Location:picture,'Cache-Control':'private, no-store'}});
      return new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
    }
    return new Response(image.body, { headers: {
      'Content-Type': image.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    } });
  } catch (e) { return error(e); }
}
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req);
    check(files(), 'Tải ảnh trực tiếp không được hỗ trợ.', 400);
    check(Number(req.headers.get('content-length') || 0) <= 3 * 1024 * 1024, 'Ảnh tối đa 2 MB.', 413);
    const form = await req.formData();
    const file = form.get('file');
    check(file instanceof File, 'Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    const image = file as File;
    check(image.size > 12 && image.size <= 2 * 1024 * 1024, 'Ảnh tối đa 2 MB.', 413);
    const bytes = new Uint8Array(await image.arrayBuffer());
    const png = [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
    const type = png ? 'image/png' : jpeg ? 'image/jpeg' : webp ? 'image/webp' : '';
    check(type && type === image.type, 'Nội dung ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG hoặc WebP.');
    await files().put(key(u.id), bytes, { httpMetadata: { contentType: type } });
    return response({ ok: true });
  } catch (e) { return error(e); }
}
export async function DELETE(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req);
    await files()?.delete(key(u.id));
    return response({ ok: true });
  } catch (e) { return error(e); }
}
