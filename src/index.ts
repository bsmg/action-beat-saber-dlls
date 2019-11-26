import { addPath, getInput, setFailed } from '@actions/core'
import JSZip from 'jszip'
import fetch from 'node-fetch'
import { resolve } from 'path'
import { REPO_BRANCH, REPO_SLUG } from './constants'
import { extractToDir } from './extract'
import { fetchVersions } from './versions'

const main = async () => {
  const input = getInput('version') || 'latest'
  const versions = await fetchVersions()

  const version = versions.get(input)
  if (version === undefined) {
    return setFailed(`Could not find version ${input}`)
  }

  const zip = await fetchZip()
  const fileRX = new RegExp(`${version}/.+`)
  const files = zip.file(fileRX)

  const dir = getInput('directory') || '/beat-saber-dlls'
  const directory = resolve(dir)
  await extractToDir(directory, files)

  addPath(directory)
}

const fetchZip: () => Promise<JSZip> = async () => {
  const url = `https://github.com/${REPO_SLUG}/archive/${REPO_BRANCH}.zip`

  const resp = await fetch(url)
  if (resp.ok === false) throw new Error('Failed to download archive')

  const buf = await resp.buffer()
  const zip = new JSZip()

  await zip.loadAsync(buf)
  return zip
}

main().catch(err => {
  const msg =
    typeof err === 'string'
      ? err
      : err instanceof Error
      ? err.stack || err.message
      : 'Unknown error'

  setFailed(msg)
})
