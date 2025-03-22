import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center mb-8">PuntoVentaSSD</h1>
        <p className="text-center mb-8 text-lg">
          Sistema de Punto de Venta para el mercado dominicano
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg text-center hover:bg-secondary/90 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}