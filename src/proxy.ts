import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import {
  homePathForRole,
  isAdminProtectedPath,
  isEmployeeProtectedPath,
  loginPathForScope,
} from "@/lib/auth/constants";
import { getSessionFromRequest } from "@/lib/auth/session";
import { routing } from "./intl/routing";

const intlMiddleware = createIntlMiddleware(routing);

const localePattern = /^\/(en|ar)(\/.*)?$/;

function parseLocalePath(pathname: string) {
  const match = pathname.match(localePattern);
  if (!match) {
    return { locale: routing.defaultLocale, path: pathname };
  }

  return {
    locale: match[1] as (typeof routing.locales)[number],
    path: match[2] || "/",
  };
}

function localizedPath(locale: string, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

export default async function proxy(request: NextRequest) {
  const { locale, path } = parseLocalePath(request.nextUrl.pathname);
  const session = await getSessionFromRequest(request);

  const isLoginPage = path === "/login" || path === "/admin/login";
  const requiresEmployeeAuth = isEmployeeProtectedPath(path);
  const requiresAdminAuth = isAdminProtectedPath(path);
  const requiresAuth = requiresEmployeeAuth || requiresAdminAuth;

  if (session && isLoginPage) {
    const destination = localizedPath(locale, homePathForRole(session.role));
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (requiresAuth && !session) {
    const loginPath = localizedPath(
      locale,
      requiresAdminAuth ? loginPathForScope("admin") : loginPathForScope("employee"),
    );
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (session && requiresAdminAuth && session.role !== "admin") {
    return NextResponse.redirect(new URL(localizedPath(locale, "/home"), request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|ar)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
