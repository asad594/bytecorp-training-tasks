import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Job Board CMS — manage jobs, companies, applicants and skills in one place.',
  title: 'Job Board CMS',
}

// Runs before React hydrates so the correct theme is applied on first paint
// (no light-flash before switching to dark, and vice versa).
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('jb-theme') || 'auto';
    var resolved = stored === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', stored);
  } catch (e) {}
})();
`

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
