import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import AnimatedCounter from '../components/common/AnimatedCounter'
import Button from '../components/common/Button'
import CategoryCard from '../components/landing/CategoryCard'
import JobCard from '../components/jobs/JobCard'
import JobDetailModal from '../components/jobs/JobDetailModal'
import useBookmarks from '../hooks/useBookmarks'
import useAuth from '../hooks/useAuth'

const sampleCategories = [
  { id: 'frontend', name: 'Frontend & UI', count: 430, icon: '💻', avgSalary: 'PKR 150k-280k' },
  { id: 'backend', name: 'Backend & APIs', count: 620, icon: '⚙️', avgSalary: 'PKR 180k-350k' },
  { id: 'ai-ml', name: 'AI & Data Science', count: 290, icon: '🤖', avgSalary: 'PKR 250k-450k' },
  { id: 'devops', name: 'Cloud & DevOps', count: 190, icon: '☁️', avgSalary: 'PKR 200k-380k' },
  { id: 'design', name: 'Product & Design', count: 310, icon: '🎨', avgSalary: 'PKR 140k-250k' },
  { id: 'mobile', name: 'Mobile Apps', count: 210, icon: '📱', avgSalary: 'PKR 160k-300k' },
]

const sampleFeaturedJobs = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'ByteCorp Technologies',
    logoLetter: 'B',
    logoBg: 'from-indigo-400 to-purple-600',
    location: 'Remote · Full-time',
    salary: 'PKR 220k - 320k / mo',
    type: 'Remote',
    posted: '2 hours ago',
    tags: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    description: 'We are seeking an experienced Frontend Engineer to build high-performance React applications. with dynamic data streams and modular architecture.',
    requirements: ['4+ years with React & TypeScript', 'Experience with Tailwind & Next.js', 'State management (Redux/Zustand)'],
    featured: true,
  },
  {
    id: 2,
    title: 'Python / Django Backend Lead',
    company: 'NimbusWorks',
    logoLetter: 'N',
    logoBg: 'from-indigo-400 to-purple-600',
    location: 'Karachi · Hybrid',
    salary: 'PKR 250k - 380k / mo',
    type: 'Hybrid',
    posted: '4 hours ago',
    tags: ['Django', 'Python', 'PostgreSQL', 'Redis'],
    description: 'Lead our backend development team in designing scalable RESTful APIs, optimizing database queries, and managing cloud infrastructure.',
    requirements: ['5+ years in Django/Python', 'Strong PostgreSQL & Redis optimization', 'REST API & WebSockets mastery'],
    featured: true,
  },
  {
    id: 3,
    title: 'Principal UI/UX Product Designer',
    company: 'Studio Forge',
    logoLetter: 'S',
    logoBg: 'from-emerald-400 to-teal-600',
    location: 'Lahore · Full-time',
    salary: 'PKR 180k - 260k / mo',
    type: 'Full-time',
    posted: '1 day ago',
    tags: ['Figma', 'Design Systems', 'User Research'],
    description: 'Shape the visual identity and user experience for next-generation tech products. Create unified design systems and interactive prototypes.',
    requirements: ['Portfolio showcasing web & mobile apps', 'Expertise in Figma & Design Systems', 'User testing & wireframing'],
    featured: false,
  },
  {
    id: 4,
    title: 'DevOps & Site Reliability Engineer',
    company: 'NextGen Cloud Labs',
    logoLetter: 'N',
    logoBg: 'from-amber-400 to-orange-500',
    location: 'Remote · Full-time',
    salary: 'PKR 280k - 420k / mo',
    type: 'Remote',
    posted: '5 hours ago',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    description: 'Manage automated CI/CD pipelines, container orchestration with Kubernetes, and maintain 99.99% infrastructure uptime on AWS.',
    requirements: ['AWS Certified / Kubernetes Expert', 'Terraform & Infrastructure as Code', 'CI/CD automation pipelines'],
    featured: true,
  },
  {
    id: 5,
    title: 'AI Prompt & LLM Application Engineer',
    company: 'Apex AI Solutions',
    logoLetter: 'A',
    logoBg: 'from-pink-500 to-rose-600',
    location: 'Islamabad · Hybrid',
    salary: 'PKR 300k - 500k / mo',
    type: 'Hybrid',
    posted: '3 hours ago',
    tags: ['PyTorch', 'LangChain', 'OpenAI', 'Python'],
    description: 'Architect generative AI solutions, fine-tune LLM models using PyTorch, and integrate intelligent agents into production systems.',
    requirements: ['Hands-on experience with LangChain/LlamaIndex', 'Python & PyTorch proficiency', 'Prompt engineering & RAG pipelines'],
    featured: true,
  },
  {
    id: 6,
    title: 'Flutter Mobile App Developer',
    company: 'FinPulse Technologies',
    logoLetter: 'F',
    logoBg: 'from-cyan-500 to-teal-400',
    location: 'Karachi · Full-time',
    salary: 'PKR 160k - 240k / mo',
    type: 'Full-time',
    posted: 'Just now',
    tags: ['Flutter', 'Dart', 'REST API', 'Firebase'],
    description: 'Develop slick cross-platform iOS and Android financial tech applications with real-time analytics and biometric authentication.',
    requirements: ['2+ years with Flutter & Dart', 'State management (Bloc/Provider)', 'Native iOS/Android integration'],
    featured: false,
  },
]

const hiringSteps = [
  {
    step: '01',
    title: 'Create Your Tech Profile',
    desc: 'Upload your resume or GitHub link. Our AI parser highlights your top skills instantly.',
    icon: '🚀',
  },
  {
    step: '02',
    title: 'Smart Role Matching',
    desc: 'Get matched with verified job opportunities tailored to your tech stack and salary goals.',
    icon: '⚡',
  },
  {
    step: '03',
    title: 'Direct HR Connection',
    desc: 'Skip generic recruiters. Connect directly with Engineering Managers and Tech Leads.',
    icon: '🤝',
  },
  {
    step: '04',
    title: 'Land Your Dream Offer',
    desc: 'Receive transparent offer letters with competitive salary packages and remote flexibility.',
    icon: '🏆',
  },
]

const testimonials = [
  {
    name: 'Hamza Tariq',
    role: 'Senior React Developer at ByteCorp',
    quote: 'Applied through JobBoard and received an interview invitation within 24 hours. The interface and application flow is unbelievably smooth!',
    avatar: '👨‍💻',
  },
  {
    name: 'Sara Khan',
    role: 'Head of Talent at NimbusWorks',
    quote: 'JobBoard helped us hire 4 Senior Django engineers in under two weeks. The quality of candidate matches is unmatched.',
    avatar: '👩‍💼',
  },
  {
    name: 'Zainab Ahmed',
    role: 'Lead UI/UX Designer',
    quote: 'The design of this platform reflects the quality of jobs on it. Best career portal for Pakistani tech professionals!',
    avatar: '🎨',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [activeTab, setActiveTab] = useState('All')
  const { bookmarks: bookmarkedJobs, toggleBookmark } = useBookmarks()
  const [selectedJobModal, setSelectedJobModal] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleQuickApply = (e) => {
    e.stopPropagation()
    if (user) {
      if (user.role === 'job_seeker') {
        navigate('/jobs')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/login/job_seeker')
    }
  }

  const handleCloseModal = () => {
    setSelectedJobModal(null)
  }

  const submitApplication = (e) => {
    e.preventDefault()
    setSelectedJobModal(null)
    if (user) {
      if (user.role === 'job_seeker') {
        navigate('/jobs')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/login/job_seeker')
    }
  }

  const filteredJobs = sampleFeaturedJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesLocation =
      locationFilter === 'All Locations' ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase())

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Remote' && job.type === 'Remote') ||
      (activeTab === 'Full-time' && job.type === 'Full-time') ||
      (activeTab === 'Hybrid' && job.type === 'Hybrid')

    return matchesSearch && matchesLocation && matchesTab
  })

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="pointer-events-none fixed bottom-10 left-1/4 h-[450px] w-[450px] rounded-full bg-teal-500/15 blur-[120px] animate-pulse-glow" style={{ animationDelay: '6s' }} />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent group-hover:to-indigo-300 transition">
              JobBoard
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#jobs" className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105">
              Explore Jobs
            </a>
            <a href="#categories" className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105">
              Categories
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105">
              How It Works
            </a>
            <a href="#companies" className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105">
              Employers
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/login/job_seeker')}
            >
              Sign in
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/register/job_seeker')}
              className="btn-gradient-shimmer"
            >
              Get Started →
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Hero Text & Search */}
          <div className="lg:col-span-7">
            {/* Top Animated Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 backdrop-blur-md transition hover:scale-105 cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300">
                Over <AnimatedCounter end={2400} suffix="+" /> new tech jobs added this week
              </span>
            </div>

            <h1 className="font-sora text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl lg:text-6xl">
              Connect with companies hiring{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                top tech talent
              </span>{' '}
              right now.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-desc sm:text-lg">
              Discover curated remote & hybrid roles in software engineering, AI, product design, and DevOps across Pakistan and worldwide.
            </p>

            {/* Interactive Search Bar Box */}
            <div className="mt-8 rounded-2xl border border-white/14 bg-white/[0.06] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                {/* Search Input */}
                <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-cyan-400/40">
                  <span className="text-slate-400 text-lg">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job title, skill (React, Django)..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                {/* Location Select */}
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 sm:w-44 transition focus-within:border-cyan-400/40">
                  <span className="text-slate-400 text-lg">📍</span>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none cursor-pointer [&>option]:bg-brand-bg"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Remote">Remote</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>

                {/* Search Button */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const jobsElem = document.getElementById('jobs')
                    jobsElem?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-gradient-shimmer px-6 py-3.5"
                >
                  <span>Search Roles</span>
                  <span>→</span>
                </Button>
              </div>
            </div>

            {/* Quick Category Tag Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Popular Searches:</span>
              {['React', 'Django', 'Python', 'Full-stack', 'Remote'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag)
                    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition duration-200 hover:border-cyan-400/50 hover:bg-cyan-400/15 hover:text-cyan-300 hover:scale-105 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Hero Stack Showcase */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto h-[430px] w-full max-w-[390px]">
              {/* Card 1 */}
              <div className="absolute top-0 left-0 w-full rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 animate-float -rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(34,211,238,0.3)] cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 font-bold text-brand-bg shadow-md">
                      B
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-white text-sm">Senior Frontend Engineer</h4>
                      <p className="text-xs text-text-secondary">ByteCorp Technologies · Remote</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-cyan-300">
                    New
                  </span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary mb-3">
                  <span>Full-time</span>
                  <span className="font-bold text-cyan-accent">PKR 220k - 320k</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">React</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">TypeScript</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">Tailwind</span>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="absolute top-36 left-4 w-full rounded-2xl border border-white/14 bg-brand-card/90 p-5 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300 animate-float rotate-3 hover:rotate-0 hover:scale-105 hover:z-30 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(34,211,238,0.3)] cursor-pointer"
                style={{ animationDelay: '1s' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 font-bold text-white shadow-md">
                      N
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-white text-sm">Django Backend Lead</h4>
                      <p className="text-xs text-text-secondary">NimbusWorks · Karachi</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-400/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-indigo-300">
                    Featured
                  </span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary mb-3">
                  <span>Hybrid</span>
                  <span className="font-bold text-cyan-accent">PKR 250k - 380k</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">Django</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">Python</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-slate-200">PostgreSQL</span>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="absolute top-72 left-2 w-full rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 animate-float -rotate-2 hover:rotate-0 hover:scale-105 hover:z-30 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(34,211,238,0.3)] cursor-pointer"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 font-bold text-brand-bg shadow-md">
                      S
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-white text-sm">Lead UI/UX Designer</h4>
                      <p className="text-xs text-text-secondary">Studio Forge · Lahore</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-300">
                    Verified
                  </span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Full-time</span>
                  <span className="font-bold text-cyan-accent">PKR 180k - 260k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Animated Scroll Metrics Banner */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.02] py-12 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:grid-cols-4 sm:px-8">
          <div className="group transition duration-300 hover:scale-105">
            <p className="font-sora text-3xl font-extrabold text-cyan-400 sm:text-4xl">
              <AnimatedCounter end={14800} suffix="+" />
            </p>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm group-hover:text-cyan-300 transition">
              Active Job Listings
            </p>
          </div>
          <div className="group transition duration-300 hover:scale-105">
            <p className="font-sora text-3xl font-extrabold text-indigo-400 sm:text-4xl">
              <AnimatedCounter end={520} suffix="+" />
            </p>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm group-hover:text-indigo-300 transition">
              Verified Companies
            </p>
          </div>
          <div className="group transition duration-300 hover:scale-105">
            <p className="font-sora text-3xl font-extrabold text-teal-300 sm:text-4xl">
              <AnimatedCounter end={98.4} suffix="%" decimals={1} />
            </p>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm group-hover:text-teal-200 transition">
              Match Success Rate
            </p>
          </div>
          <div className="group transition duration-300 hover:scale-105">
            <p className="font-sora text-3xl font-extrabold text-cyan-400 sm:text-4xl">
              &lt; <AnimatedCounter end={24} suffix=" hrs" />
            </p>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm group-hover:text-cyan-300 transition">
              Avg. Response Time
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section id="categories" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <h2 className="font-sora text-3xl font-bold text-white sm:text-4xl">
            Explore Opportunities by Category
          </h2>
          <p className="mt-3 text-sm text-text-desc sm:text-base">
            Find the right track tailored to your specialized engineering skillset.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => {
                setSearchQuery(cat.name.split(' ')[0])
                const elem = document.getElementById('jobs')
                elem?.scrollIntoView({ behavior: 'smooth' })
              }}
            />
          ))}
        </div>
      </section>

      {/* Interactive Featured Jobs Section */}
      <section id="jobs" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-sora text-3xl font-bold text-white sm:text-4xl">
              Latest Featured Roles
            </h2>
            <p className="mt-2 text-sm text-text-desc">
              Hand-picked opportunities updated in real-time from top hiring partners.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {['All', 'Remote', 'Full-time', 'Hybrid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Feed Grid */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isBookmarked={!!bookmarkedJobs[job.id]}
              onToggleBookmark={toggleBookmark}
              onQuickApply={handleQuickApply}
              onClick={() => setSelectedJobModal(job)}
            />
          ))}
        </div>
      </section>

      {/* How It Works Timeline */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <h2 className="font-sora text-3xl font-bold text-white sm:text-4xl">
            How JobBoard Works
          </h2>
          <p className="mt-3 text-sm text-text-desc sm:text-base">
            From registration to job offer in four simple steps.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hiringSteps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-white/12 bg-white/[0.05] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:bg-white/[0.08] hover:shadow-[0_12px_30px_rgba(34,211,238,0.15)] cursor-pointer"
            >
              <span className="font-sora text-3xl font-extrabold text-cyan-400/40 group-hover:text-cyan-300 transition">
                {s.step}
              </span>
              <div className="mt-2 text-3xl transition duration-300 group-hover:scale-125">{s.icon}</div>
              <h3 className="mt-3 font-sora text-lg font-bold text-white group-hover:text-cyan-300 transition">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 border-t border-white/10 bg-white/[0.02] py-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center">
            <h2 className="font-sora text-3xl font-bold text-white sm:text-4xl">
              Loved by Candidates & Employers
            </h2>
            <p className="mt-2 text-sm text-text-desc">
              Hear from software engineers and companies hiring through our platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-xl shadow-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.09]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl transition duration-300 group-hover:scale-125">{t.avatar}</span>
                  <div>
                    <h4 className="font-sora text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 italic">
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Banner */}
      <section id="companies" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/14 bg-gradient-to-r from-cyan-900/40 via-indigo-900/30 to-brand-bg p-10 text-center backdrop-blur-2xl sm:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition hover:border-cyan-400/40">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl animate-pulse-glow" />

          <h2 className="font-sora text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Ready to Take the Next Step in Your Career?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-desc sm:text-base">
            Create your account today to apply for top software engineer, UI designer, and product manager roles.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register/job_seeker')}
              className="btn-gradient-shimmer"
            >
              Sign Up as Job Seeker →
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login/company_rep')}
            >
              Employer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-brand-footer py-12 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="font-sora text-lg font-bold text-white">
                JobBoard
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Precision career matching platform connecting top engineering talent with leading tech companies.
              </p>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">For Candidates</h4>
              <ul className="space-y-2">
                <li><a href="#jobs" className="hover:text-cyan-400 transition">Browse Jobs</a></li>
                <li><Link to="/login/job_seeker" className="hover:text-cyan-400 transition">Job Seeker Login</Link></li>
                <li><Link to="/register/job_seeker" className="hover:text-cyan-400 transition">Register Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">For Employers</h4>
              <ul className="space-y-2">
                <li><Link to="/login/company_rep" className="hover:text-cyan-400 transition">Employer Portal</Link></li>
                <li><Link to="/register/company_rep" className="hover:text-cyan-400 transition">Post a Job</Link></li>
                <li><Link to="/login/admin" className="hover:text-cyan-400 transition">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">Platform</h4>
              <p className="text-xs text-text-secondary mb-3">
                Built with React, Tailwind CSS, & Django REST Framework.
              </p>
              <p className="text-[0.7rem] text-slate-500">
                © {new Date().getFullYear()} JobBoard. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-bold text-brand-bg shadow-[0_0_20px_rgba(34,211,238,0.5)] transition duration-200 hover:scale-110 active:scale-95 cursor-pointer animate-fade-in-up"
          title="Scroll to Top"
        >
          ↑
        </button>
      )}

      {/* Interactive Job Detail Modal */}
      <JobDetailModal
        job={selectedJobModal}
        onClose={handleCloseModal}
        onSubmitApplication={submitApplication}
        appliedSuccess={false}
      />
    </div>
  )
}
