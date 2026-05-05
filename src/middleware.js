import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Crear una respuesta inicial
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Inicializar el cliente de Supabase (Correcto dentro de la función)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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

  // 3. Obtener el usuario y la ruta actual
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const rol = user?.user_metadata?.rol

  // DEBUG: Esto aparecerá en tu terminal de VS Code
  console.log(`🛡️ Middleware: [${pathname}] | Usuario: ${user?.email || 'No logueado'} | Rol: ${rol || 'Sin rol'}`);

  // --- LÓGICA DE REDIRECCIONES ---

  // A. Si no hay usuario y trata de entrar al dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // B. Si hay usuario y está en el login, mandarlo a su dashboard según rol
  if (user && pathname === '/login') {
    let target = '/dashboard/vendedor' // Por defecto
    if (rol === 'admin') target = '/dashboard/admin'
    else if (rol === 'cliente') target = '/dashboard/cliente'
    
    return NextResponse.redirect(new URL(target, request.url))
  }

  // C. PROTECCIÓN DE RUTAS POR ROL (Solo si está en /dashboard)
  if (user && pathname.startsWith('/dashboard')) {
    
    // Protección para ADMIN
    if (pathname.startsWith('/dashboard/admin') && rol !== 'admin') {
      const target = rol === 'cliente' ? '/dashboard/cliente' : '/dashboard/vendedor'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Protección para VENDEDOR
    if (pathname.startsWith('/dashboard/vendedor') && rol !== 'vendedor') {
      const target = rol === 'admin' ? '/dashboard/admin' : '/dashboard/cliente'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Protección para CLIENTE
    if (pathname.startsWith('/dashboard/cliente') && rol !== 'cliente') {
      const target = rol === 'admin' ? '/dashboard/admin' : '/dashboard/vendedor'
      return NextResponse.redirect(new URL(target, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto archivos estáticos y API
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}