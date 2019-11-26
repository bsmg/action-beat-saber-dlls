import { debug } from '@actions/core'
import fetch from 'node-fetch'
import { rcompare } from 'semver'
import { REPO_BRANCH, REPO_SLUG, VERSION_JSON } from './constants'

type VersionMap = Map<string, string>
interface IVersions {
  [key: string]: string
}

const versionMap: (versions: IVersions) => VersionMap = versions => {
  const versionArr: string[] = Object.values(versions)
  const [latest] = versionArr
    .map(x => verToSemver(x))
    .sort((a, b) => rcompare(a, b))
    .map(x => semverToVer(x))

  const manifestMap = new Map(Object.entries(versions))
  const latestMap = new Map([['latest', latest]])
  const dummyMap = new Map(versionArr.map(x => [x, x]))

  return new Map([...manifestMap, ...dummyMap, ...latestMap])
}

const verToSemver: (v: string) => string = v =>
  v.replace(/(\d+)\.(\d+)\.(\d+)(?:p(\d+))/, '$1.$2.$400$3')

const semverToVer: (v: string) => string = v => {
  return v.replace(/(\d+)\.(\d+)\.(\d+)00(\d+)/, '$1.$2.$4p$3')
}

export const fetchVersions: () => Promise<VersionMap> = async () => {
  const url = `https://raw.githubusercontent.com/${REPO_SLUG}/${REPO_BRANCH}/${VERSION_JSON}`
  debug(`Fetching version info from ${url}`)

  const resp = await fetch(url)
  if (resp.ok === false) throw new Error('Failed to get version info')

  const versions: IVersions = await resp.json()
  return versionMap(versions)
}
