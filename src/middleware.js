import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // auth.getUser() es más lento pero más seguro que getSession()
  // Lo llamamos solo una vez.
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // --- OPTIMIZACIÓN DE RUTAS PÚBLICAS ---
  // Si no hay usuario y no está intentando entrar al dashboard, dejar pasar de inmediato
  if (!user && !pathname.startsWith('/dashboard')) {
    return response
  }

  // 1. PROTECCIÓN DE DASHBOARD
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. LÓGICA DE LOGIN (Aquí es donde evitamos consultas infinitas)
  if (user && pathname === '/login') {
    // En lugar de consultar la DB cada vez, miramos los metadatos que guardamos al registrar
    const role = user.user_metadata?.rol
    const target = role === 'admin' ? '/dashboard/admin' : '/dashboard/vendedor'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 3. SEGURIDAD CRUZADA (Evitar que un vendedor entre a rutas de admin)
  if (user && pathname.startsWith('/dashboard/admin')) {
    const role = user.user_metadata?.rol
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/vendedor', request.url))
    }
  }

  return response
}


export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que comienzan con:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}