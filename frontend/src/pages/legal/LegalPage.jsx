import { Link, useParams, useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'

const content = {
  terms: {
    job_seeker: {
      title: 'Terms of Service — Job Seekers',
      sections: [
        {
          heading: '1. Your Account',
          body: [
            'You must provide accurate, current information when creating your JobBoard profile, including your name, contact details, and work history.',
            'You are responsible for keeping your login credentials confidential and for all activity that occurs under your account.',
          ],
        },
        {
          heading: '2. Applying for Roles',
          body: [
            'When you apply to a job, your profile, resume, and cover letter are shared directly with the hiring company associated with that listing.',
            'You may withdraw an application at any time from your Applications dashboard, but the company may retain records of it per their own policies.',
          ],
        },
        {
          heading: '3. Acceptable Use',
          body: [
            'Do not submit false credentials, plagiarized resumes, or misrepresent your work history or qualifications.',
            'Do not use JobBoard to spam employers, scrape listings, or attempt to access accounts other than your own.',
          ],
        },
        {
          heading: '4. Account Termination',
          body: [
            'We may suspend or terminate accounts that violate these terms, submit fraudulent applications, or abuse the platform.',
          ],
        },
      ],
    },
    company_rep: {
      title: 'Terms of Service — Employers',
      sections: [
        {
          heading: '1. Company Verification',
          body: [
            'Employer accounts are linked to a registered company profile. Job postings only become publicly visible once your company has been verified by our admin team.',
            'You must have genuine authority to post jobs and review applicants on behalf of the company you represent.',
          ],
        },
        {
          heading: '2. Job Listings',
          body: [
            'Listings must accurately describe the role, compensation range, and requirements. Discriminatory or misleading listings are not permitted.',
            'You are responsible for keeping listings up to date and closing roles once they are filled.',
          ],
        },
        {
          heading: '3. Applicant Data',
          body: [
            'Resumes, cover letters, and contact details submitted by applicants may only be used for evaluating that applicant for the role applied to.',
            'You may not sell, share, or repurpose applicant data for unrelated marketing or recruiting outside JobBoard.',
          ],
        },
        {
          heading: '4. Account Termination',
          body: [
            'We may suspend or unverify a company account for policy violations, fraudulent listings, or misuse of applicant data.',
          ],
        },
      ],
    },
  },
  privacy: {
    job_seeker: {
      title: 'Privacy Policy — Job Seekers',
      sections: [
        {
          heading: '1. What We Collect',
          body: [
            'Profile details you provide: name, email, years of experience, skills, resume files, and cover letters.',
            'Usage data such as which jobs you view, bookmark, or apply to, used to improve recommendations.',
          ],
        },
        {
          heading: '2. How We Use Your Data',
          body: [
            'To match you with relevant job listings and share your application materials with employers you apply to.',
            'To send account-related emails, such as password resets and application status updates.',
          ],
        },
        {
          heading: '3. Who Can See Your Data',
          body: [
            'Your full profile and resume are visible to a company only after you submit an application to one of their listings.',
            'We do not sell your personal data to third parties.',
          ],
        },
        {
          heading: '4. Your Choices',
          body: [
            'You can update or delete your profile information at any time from your account settings.',
            'You can withdraw applications, which removes them from that employer\'s active review queue.',
          ],
        },
      ],
    },
    company_rep: {
      title: 'Privacy Policy — Employers',
      sections: [
        {
          heading: '1. What We Collect',
          body: [
            'Company profile details: name, registration number, verification documents, and representative contact information.',
            'Job listing content, and applicant interactions such as status changes and internal notes on applications.',
          ],
        },
        {
          heading: '2. How We Use Your Data',
          body: [
            'To verify your company, publish your listings, and route applicant submissions to your dashboard.',
            'To send account-related emails, such as verification updates and new applicant notifications.',
          ],
        },
        {
          heading: '3. Applicant Information',
          body: [
            'Applicant resumes and cover letters are made available to you solely to evaluate candidates for your open roles.',
            'You must handle applicant data in line with the Terms of Service — it may not be reused outside the platform.',
          ],
        },
        {
          heading: '4. Your Choices',
          body: [
            'You can update your company profile or request account closure by contacting support.',
          ],
        },
      ],
    },
  },
}

export default function LegalPage() {
  const { docType, role } = useParams()
  const navigate = useNavigate()

  const doc = content[docType]?.[role] || content.terms.job_seeker

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans overflow-hidden">
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              JobBoard
            </span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="rounded-3xl border border-white/14 bg-white/[0.06] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl mb-1">
            {doc.title}
          </h1>
          <p className="text-xs text-text-secondary mb-8">Last updated: September 2026</p>

          <div className="space-y-8">
            {doc.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-sora text-lg font-bold text-cyan-300 mb-2">
                  {section.heading}
                </h2>
                <div className="space-y-2">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-300">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}