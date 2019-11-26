import { mkdirP } from '@actions/io'
import { createWriteStream } from 'fs'
import { JSZipObject } from 'jszip'
import pLimit from 'p-limit'
import { join, parse } from 'path'

export const extractToDir: (
  path: string,
  entries: JSZipObject[]
) => Promise<void> = async (path, entries) => {
  await mkdirP(path)

  const limit = pLimit(10)
  const tasks = entries.map(x => limit(() => extractEntry(path, x)))
  await Promise.all(tasks)
}

const extractEntry: (path: string, entry: JSZipObject) => Promise<void> = (
  path,
  entry
) =>
  new Promise(async (resolve, reject) => {
    try {
      const { base } = parse(entry.name)
      const filePath = join(path, base)

      const stream = entry.nodeStream().pipe(createWriteStream(filePath))
      stream.on('close', () => {
        return resolve()
      })
    } catch (err) {
      return reject(err)
    }
  })
