// src/pages/Home.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gamesService } from "@/services/games";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import { ArrowRight, Star, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const GameCard = ({ game }: { game: any }) => {
  const imageUrl = game.tem_imagem
    ? gamesService.getImageUrl(game.id_jogo)
    : "/placeholder.svg";

  return (
    <Link
      to={`/game/${game.id_jogo}`}
      className="group relative block w-72 flex-shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#2dd4bf]/40"
    >
      <div className="aspect-[3/4] overflow-hidden bg-card/50">
        <img
          src={imageUrl}
          alt={game.nm_jogo}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-pixel text-xl text-white drop-shadow-2xl line-clamp-2">
          {game.nm_jogo}
        </h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded bg-[#2dd4bf] px-3 py-1.5 text-sm font-bold text-black">
            <Star className="h-4 w-4 fill-current" />
            <span>9.2</span>
          </div>
          <span className="text-sm text-white/70">{game.genero}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-[#2dd4bf]/0 transition-all duration-500 group-hover:ring-[#2dd4bf]/60" />
    </Link>
  );
};

const Home = () => {
  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: gamesService.getAll,
  });

  const featuredGames = games.slice(0, 5);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || featuredGames.length === 0) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 50;

      if (isAtEnd) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading, featuredGames]);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-start items-center px-6 pt-28 md:pt-36 lg:pt-44">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10 md:space-y-12">
          <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            <span className="block">Organize sua</span>
            <span className="block bg-gradient-to-r from-[#2dd4bf] via-[#99f6e4] to-[#2dd4bf] bg-clip-text text-transparent">
              jornada gamer
            </span>
            <span className="block">em um só lugar</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Coleção, listas personalizadas, progresso, conquistas e comunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold px-10 h-16 text-lg rounded-xl shadow-xl hover:shadow-[#2dd4bf]/40">
              <Link to="/games">Explorar Jogos <ArrowRight className="ml-3 h-6 w-6" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf]/10 font-bold px-10 h-16 text-lg rounded-xl backdrop-blur-md">
              <Link to="/lists">Ver Listas da Comunidade</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DESTAQUES DA SEMANA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-pixel text-3xl sm:text-4xl text-white">
                Destaques da <span className="text-[#2dd4bf]">Semana</span>
              </h2>
              <p className="text-muted-foreground mt-2">Os jogos mais quentes do momento</p>
            </div>
            <Link to="/games">
              <Button variant="ghost" className="text-[#2dd4bf] hover:text-white hover:bg-[#2dd4bf]/20">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

            <div ref={scrollRef} className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-8 md:px-16 lg:px-24">
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <div key={i} className="w-72 flex-shrink-0">
                      <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-card/30" />
                      <Skeleton className="mt-4 h-7 w-56 rounded" />
                    </div>
                  ))
                : featuredGames.map((game) => <GameCard key={game.id_jogo} game={game} />)}
            </div>

            <button onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: "smooth" })} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-2xl border border-white/10 transition-all hover:scale-110 hover:bg-[#2dd4bf] hover:text-black">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" })} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-2xl border border-white/10 transition-all hover:scale-110 hover:bg-[#2dd4bf] hover:text-black">
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-pixel text-3xl sm:text-4xl md:text-5xl mb-6">
              Por que escolher o<br />
              <span className="text-[#2dd4bf]">Checkpoint?</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para viver sua paixão por jogos de forma organizada e social.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Star, title: "Coleção Completa", desc: "Adicione todos os seus jogos: backlog, jogando, concluídos e favoritos com notas e status." },
              { icon: Users, title: "Listas Incríveis", desc: "Crie rankings, temáticas, recomendações e compartilhe com a comunidade brasileira." },
              { icon: TrendingUp, title: "Progresso Visível", desc: "Estatísticas detalhadas, gráficos de evolução, conquistas e metas anuais." },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border/50 
                           bg-[#08140f] p-10 backdrop-blur-sm 
                           transition-all duration-500 
                           hover:-translate-y-4 hover:border-[#2dd4bf]/70 
                           hover:bg-[#0b1c19] hover:shadow-2xl hover:shadow-[#2dd4bf]/30"
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2dd4bf]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2dd4bf]/20 transition-colors group-hover:bg-[#2dd4bf]/30">
                    <feature.icon className="h-8 w-8 text-[#2dd4bf]" />
                  </div>
                  <h3 className="mb-4 font-pixel text-lg text-foreground sm:text-xl">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
