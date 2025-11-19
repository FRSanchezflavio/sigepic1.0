import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserPlus, Search, UserCog, LogOut, Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuOptions = [
    {
      title: 'Agregar Personal',
      description: 'Registrar nuevo personal del Departamento D-2',
      icon: UserPlus,
      path: '/personal/agregar',
      gradient: 'from-police-navy to-police-navy-dark',
      bgGradient: 'from-police-cyan/20 to-cyan-400/10',
      iconColor: 'text-police-navy',
    },
    {
      title: 'Buscar Personal',
      description: 'Buscar y descargar planillas del personal',
      icon: Search,
      path: '/personal/buscar',
      gradient: 'from-police-cyan to-cyan-400',
      bgGradient: 'from-police-navy/10 to-police-navy-light/10',
      iconColor: 'text-police-navy',
    },
    {
      title: 'Editar Personal',
      description: 'Modificar información del personal existente',
      icon: UserCog,
      path: '/personal',
      gradient: 'from-police-navy-light to-police-navy',
      bgGradient: 'from-cyan-300/10 to-police-cyan/10',
      iconColor: 'text-police-navy',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-slate-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-police-cyan/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-police-navy/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg sticky top-0 z-50 relative"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="relative w-14 h-14 bg-gradient-to-br from-police-navy via-police-navy-dark to-police-navy rounded-2xl flex items-center justify-center shadow-xl border-2 border-police-cyan/50"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Shield className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-police-cyan rounded-full border-2 border-white shadow-lg animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-police-navy via-police-navy-light to-police-cyan bg-clip-text text-transparent tracking-tight">
                  SIGEPIC
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Departamento de Inteligencia Criminal D-2
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-right hidden sm:block bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/60">
                <p className="text-sm font-bold text-police-navy">
                  {user?.nombreCompleto || user?.username}
                </p>
                <p className="text-xs text-police-cyan capitalize font-semibold">{user?.rol}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all hover:shadow-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Welcome Section */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-police-navy via-police-navy-light to-police-cyan bg-clip-text text-transparent mb-6 leading-tight">
              Bienvenido, {user?.nombreCompleto || user?.username}
            </h2>
          </motion.div>
          <motion.p 
            className="text-xl text-slate-600 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Sistema de Gestión del Personal del Departamento de Inteligencia Criminal D-2
          </motion.p>
          <motion.div
            className="mt-6 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-police-cyan/10 border border-police-cyan/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-700 font-semibold">Sistema Activo</span>
            </div>
            <div className="px-4 py-2 bg-white/80 border border-slate-200 rounded-full text-sm text-slate-600 font-medium shadow-sm">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </motion.div>
        </motion.div>

        {/* Menu Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {menuOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div 
                key={index} 
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer border-2 border-slate-200/60 hover:border-police-cyan/60 transition-all duration-300 hover:shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden relative h-[280px] flex flex-col"
                  onClick={() => navigate(option.path)}
                >
                  {/* Card Header with Icon */}
                  <div className={`bg-gradient-to-br ${option.gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                    <motion.div
                      className="relative z-10"
                      whileHover={{ scale: 1.08, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-police-cyan transition-colors duration-300">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 leading-relaxed font-medium line-clamp-2">
                        {option.description}
                      </CardDescription>
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm font-semibold text-police-cyan group-hover:translate-x-1 transition-transform duration-300 inline-block">
                        Acceder →
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-police-cyan/60 group-hover:bg-police-cyan transition-colors" />
                        <div className="w-1.5 h-1.5 rounded-full bg-police-cyan/40 group-hover:bg-police-cyan/80 transition-colors" />
                        <div className="w-1.5 h-1.5 rounded-full bg-police-cyan/20 group-hover:bg-police-cyan/60 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info Footer */}
        <motion.div
          className="mt-20 text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-police-cyan rounded-full" />
              <span className="text-sm font-semibold text-slate-700">Versión 1.0</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-police-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">
                Último acceso: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Selecciona una opción para comenzar a gestionar el personal del departamento
          </p>
        </motion.div>
      </main>
    </div>
  );
}
