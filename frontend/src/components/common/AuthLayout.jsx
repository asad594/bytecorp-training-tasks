import { Link } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'

const jobCardsData = {
  jobs: [
    {
      title: 'Frontend Engineer',
      company: 'ByteCorp Technologies',
      location: 'Remote · Full-time',
      salary: 'PKR 150k–220k',
      tags: ['React', 'Remote'],
      rotate: -6,
    },
    {
      title: 'Backend Developer (Django)',
      company: 'NimbusWorks',
      location: 'Karachi · Full-time',
      salary: 'PKR 180k–260k',
      tags: ['Django', 'REST API'],
      rotate: 3,
    },
    {
      title: 'UI/UX Designer',
      company: 'Studio Forge',
      location: 'Hybrid · Contract',
      salary: 'PKR 120k–180k',
      tags: ['Figma', 'Design'],
      rotate: -2,
    },
  ],
  hiring: [
    {
      title: 'Senior Python Dev',
      company: 'ByteCorp Hiring Hub',
      location: 'Karachi · On-site',
      salary: 'PKR 250k–350k',
      tags: ['Django', 'PostgreSQL'],
      rotate: -5,
    },
    {
      title: 'Applicant Pipeline',
      company: '32 New Resumes Today',
      location: 'Active Reviewing',
      salary: '4 Roles Open',
      tags: ['Hiring', 'Shortlisting'],
      rotate: 4,
    },
    {
      title: 'Product Manager',
      company: 'ByteCorp Technologies',
      location: 'Hybrid · Full-time',
      salary: 'PKR 300k–420k',
      tags: ['Product', 'Agile'],
      rotate: -2,
    },
  ],
}

export default function AuthLayout({
  badgeLabel = 'JobBoard',
  heading,
  subheading,
  showFloatingCards = true,
  cardsVariant = 'jobs',
  children,
}) {
  const cards = jobCardsData[cardsVariant] || jobCardsData.jobs

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Animated Glowing Orbs Background */}
      <div className="pointer-events-none absolute -top-28 -left-24 h-[450px] w-[450px] rounded-full bg-cyan-400/20 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[420px] w-[420px] rounded-full bg-indigo-500/25 blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 flex w-full max-w-[1140px] flex-col items-center justify-between gap-10 lg:flex-row lg:gap-16">
        {/* Brand & Left Content */}
        <div className="w-full flex-1 text-center lg:text-left">
          {/* Brand Mark */}
          <Link to="/" className="inline-flex items-center gap-2 text-[1.1rem] font-bold font-sora text-white mb-6 transition duration-200 hover:scale-105">
            <BriefcaseIcon width="24" height="24" stroke={colors.gradient.from} strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">{badgeLabel}</span>
          </Link>

          {/* Heading */}
          <h1 className="font-sora text-3xl sm:text-4xl lg:text-[2.3rem] font-extrabold leading-[1.28] text-white tracking-tight mb-4">
            {Array.isArray(heading) ? (
              <>
                {heading[0]} <br className="hidden sm:inline" />
                {heading[1]}
              </>
            ) : (
              heading
            )}
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base leading-relaxed text-text-desc max-w-[420px] mx-auto lg:mx-0 mb-8">
            {subheading}
          </p>

          {/* Signature floating job cards stack */}
          {showFloatingCards && (
            <div className="relative h-[230px] w-full max-w-[420px] mx-auto lg:mx-0 hidden sm:block">
              {cards.map((job, i) => (
                <div
                  key={i}
                  className="absolute w-[300px] rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 animate-float hover:rotate-0 hover:-translate-y-3 hover:scale-105 hover:z-30 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(34,211,238,0.3)] cursor-pointer"
                  style={{
                    top: `${i * 38}px`,
                    left: `${i * 14}px`,
                    '--rot': `${job.rotate}deg`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-400 font-bold text-brand-bg text-sm shadow-md">
                      {job.company.charAt(0)}
                    </div>
                    <div className="overflow-hidden text-left">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition">{job.title}</h4>
                      <span className="text-xs text-text-secondary block truncate">{job.company}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-text-secondary mb-2.5">
                    <span>{job.location}</span>
                    <span className="font-bold text-cyan-accent">{job.salary}</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-tag-text transition hover:bg-cyan-400/20 hover:text-cyan-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side form wrapper with entrance animation */}
        <div className="w-full max-w-[420px] flex-shrink-0 animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  )
}