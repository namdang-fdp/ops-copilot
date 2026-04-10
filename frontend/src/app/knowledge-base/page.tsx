'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ContributionStatus = 'pending' | 'processing' | 'active' | 'failed'
type KnowledgeScope = 'global' | 'tenant'
type IngestionMethod = 'upload' | 'sitemap' | 'webhook'

interface Contribution {
  id: string
  name: string
  source: string
  method: IngestionMethod
  scope: KnowledgeScope
  status: ContributionStatus
  date: string
}

export default function KnowledgeBasePage() {
  const router = useRouter()
  const [knowledgeScope, setKnowledgeScope] = useState<KnowledgeScope>('global')
  const [globalTab, setGlobalTab] = useState<'file' | 'sitemap'>('file')
  const [tenantTab, setTenantTab] = useState<'manual' | 'webhook'>('manual')
  const [projectName, setProjectName] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [integrationSource, setIntegrationSource] = useState<string>('github')
  const [webhookUrl, setWebhookUrl] = useState('https://api.sealcopilot.com/webhooks/github/tenant-abc-xyz-123')
  const [secretToken, setSecretToken] = useState('')
  const [contributions, setContributions] = useState<Contribution[]>([
    { id: '1', name: 'kubernetes', source: 'deployment-guide.pdf', method: 'upload', scope: 'global', status: 'active', date: '2024-01-15' },
    { id: '2', name: 'aws', source: 'https://docs.aws.amazon.com/sitemap.xml', method: 'sitemap', scope: 'global', status: 'processing', date: '2024-01-14' },
    { id: '3', name: 'payment-service', source: 'github.com/company/repo', method: 'webhook', scope: 'tenant', status: 'active', date: '2024-01-13' },
    { id: '4', name: 'postgresql', source: 'admin-manual.pdf', method: 'upload', scope: 'global', status: 'failed', date: '2024-01-12' },
    { id: '5', name: 'core-banking', source: 'gitlab.com/company/repo', method: 'webhook', scope: 'tenant', status: 'active', date: '2024-01-11' },
  ])

   const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const fileName = files[0].name
      const newContribution: Contribution = {
        id: Date.now().toString(),
        name: projectName,
        source: fileName,
        method: 'upload',
        scope: 'tenant',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      }
      setContributions(prev => [newContribution, ...prev])
      setProjectName('')
    }
  }

  const handleGlobalFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName) return
    
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name: projectName,
      source: 'uploaded-file.pdf',
      method: 'upload',
      scope: 'global',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => [newContribution, ...prev])
    setProjectName('')
  }

  const handleGlobalSitemapSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName || !sitemapUrl) return
    
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name: projectName,
      source: sitemapUrl,
      method: 'sitemap',
      scope: 'global',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => [newContribution, ...prev])
    setProjectName('')
    setSitemapUrl('')
  }

  const handleTenantFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName) return
    
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name: projectName,
      source: 'uploaded-runbook.pdf',
      method: 'upload',
      scope: 'tenant',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => [newContribution, ...prev])
    setProjectName('')
  }

  const handleWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!integrationSource) return
    
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name: `${integrationSource}-integration`,
      source: `${integrationSource}.com/company/repo`,
      method: 'webhook',
      scope: 'tenant',
      status: 'processing',
      date: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => [newContribution, ...prev])
    setSecretToken('')
  }

  const getStatusBadgeColor = (status: ContributionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-950 text-yellow-300'
      case 'processing':
        return 'bg-blue-950 text-blue-300'
      case 'active':
        return 'bg-green-950 text-green-300'
      case 'failed':
        return 'bg-red-950 text-red-300'
    }
  }

  const getScopeDisplay = (scope: KnowledgeScope) => {
    return scope === 'global' ? 'Global' : 'Tenant'
  }

  const getMethodDisplay = (method: IngestionMethod) => {
    switch (method) {
      case 'upload': return 'Upload'
      case 'sitemap': return 'Sitemap'
      case 'webhook': return 'Webhook'
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl)
    alert('Webhook URL copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">SEAL Copilot</h2>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <Link href="/dashboard" className="block px-4 py-2 rounded-sm hover:bg-zinc-900 text-zinc-400 text-sm transition">
            Dashboard
          </Link>
          <Link href="/war-room" className="block px-4 py-2 rounded-sm hover:bg-zinc-900 text-zinc-400 text-sm transition">
            War Room
          </Link>
          <Link href="/knowledge-base" className="block px-4 py-2 rounded-sm bg-zinc-800 text-white text-sm font-medium">
            Knowledge Base
          </Link>
        </nav>
        <div className="p-6 border-t border-zinc-800">
          <button
            onClick={() => {
              localStorage.removeItem('auth_token')
              router.push('/')
            }}
            className="w-full px-4 py-2 rounded-sm border border-zinc-800 hover:bg-zinc-900 text-sm transition text-zinc-400"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Knowledge Base</h1>
          <p className="text-zinc-400 mb-6">Contribute training data to improve SEAL Copilot incident resolution capabilities</p>
          
          <div className="flex gap-2 bg-zinc-950 rounded-sm p-1">
            <button
              onClick={() => setKnowledgeScope('global')}
              className={`px-6 py-2 text-sm font-medium rounded-sm transition ${
                knowledgeScope === 'global'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Global Knowledge
            </button>
            <button
              onClick={() => setKnowledgeScope('tenant')}
              className={`px-6 py-2 text-sm font-medium rounded-sm transition ${
                knowledgeScope === 'tenant'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tenant Knowledge
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Ingestion Form */}
          <div>
            {knowledgeScope === 'global' ? (
              <>
                {/* Global Knowledge Tabs */}
                <div className="flex gap-2 mb-6 border-b border-zinc-800">
                  <button
                    onClick={() => setGlobalTab('file')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      globalTab === 'file'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setGlobalTab('sitemap')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      globalTab === 'sitemap'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Submit Sitemap
                  </button>
                </div>

                {/* Global File Upload */}
                {globalTab === 'file' && (
                  <form onSubmit={handleGlobalFileUploadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tech Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., aws, kubernetes, docker"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`p-8 border-2 border-dashed rounded-sm text-center transition cursor-pointer ${
                        dragActive
                          ? 'border-white bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm text-zinc-400 mb-1">Drag and drop files here</p>
                      <p className="text-xs text-zinc-500 mb-3">or click to select</p>
                      <input type="file" className="hidden" />
                      <p className="text-xs text-zinc-600">Supports: PDF, MD, TXT, MP4, CSV</p>
                    </div>

                    <button
                      type="submit"
                      disabled={!projectName}
                      className="w-full px-4 py-2 bg-white text-black font-medium rounded-sm hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {/* Global Sitemap */}
                {globalTab === 'sitemap' && (
                  <form onSubmit={handleGlobalSitemapSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tech Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., aws, kubernetes"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Sitemap URL</label>
                      <input
                        type="url"
                        value={sitemapUrl}
                        onChange={(e) => setSitemapUrl(e.target.value)}
                        placeholder="https://example.com/sitemap.xml"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!projectName || !sitemapUrl}
                      className="w-full px-4 py-2 bg-white text-black font-medium rounded-sm hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                {/* Tenant Knowledge Tabs */}
                <div className="flex gap-2 mb-6 border-b border-zinc-800">
                  <button
                    onClick={() => setTenantTab('manual')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      tenantTab === 'manual'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Manual Push
                  </button>
                  <button
                    onClick={() => setTenantTab('webhook')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      tenantTab === 'webhook'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Auto Pull (Webhook)
                  </button>
                </div>

                {/* Tenant Manual Push */}
                {tenantTab === 'manual' && (
                  <form onSubmit={handleTenantFileUploadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project/Domain Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., payment-service, core-banking"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`p-8 border-2 border-dashed rounded-sm text-center transition cursor-pointer ${
                        dragActive
                          ? 'border-white bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm text-zinc-400 mb-1">Drag and drop runbooks here</p>
                      <p className="text-xs text-zinc-500 mb-3">or click to select</p>
                      <input type="file" className="hidden" />
                      <p className="text-xs text-zinc-600">Supports: MD, PDF, DOCX</p>
                    </div>

                    <button
                      type="submit"
                      disabled={!projectName}
                      className="w-full px-4 py-2 bg-white text-black font-medium rounded-sm hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {/* Tenant Webhook Integration */}
                {tenantTab === 'webhook' && (
                  <form onSubmit={handleWebhookSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Integration Source</label>
                      <select
                        value={integrationSource}
                        onChange={(e) => setIntegrationSource(e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 focus:outline-none focus:border-white transition"
                      >
                        <option value="github">GitHub</option>
                        <option value="gitlab">GitLab</option>
                        <option value="confluence">Confluence</option>
                        <option value="jira">Jira</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Webhook URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookUrl}
                          readOnly
                          className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 focus:outline-none cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-zinc-800 text-zinc-50 rounded-sm hover:bg-zinc-700 transition font-medium text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Secret Token (Optional)</label>
                      <input
                        type="password"
                        value={secretToken}
                        onChange={(e) => setSecretToken(e.target.value)}
                        placeholder="Enter your secret token"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-white text-black font-medium rounded-sm hover:bg-zinc-100 transition"
                    >
                      Generate & Save Webhook
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Right: Recent Contributions Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Contributions</h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Scope</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contrib) => (
                    <tr key={contrib.id} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition">
                      <td className="px-4 py-3 text-sm text-zinc-50 capitalize font-medium">{contrib.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                          contrib.scope === 'global' 
                            ? 'bg-zinc-800 text-zinc-400' 
                            : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          {getScopeDisplay(contrib.scope)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-sm text-xs font-medium bg-zinc-800 text-zinc-300">
                          {getMethodDisplay(contrib.method)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium capitalize ${getStatusBadgeColor(contrib.status)}`}>
                          {contrib.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
