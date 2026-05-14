'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Back' }: { label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <ArrowLeft size={22} color="#1D1D1F" strokeWidth={2} />
    </button>
  )
}
