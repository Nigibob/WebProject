import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class Metric {
    public timestamp: string
    public value: number

    constructor(ts: string, v: number) {
      this.timestamp = ts
      this.value = v
    }
}

export class MetricsHandler {
  public db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

    public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.on('close', callback)
      metrics.forEach((m: Metric) => {
        stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value })
      })
      stream.end()
    }
    public delete(key: string, callback: (error: Error | null, result?: Metric[]) => void) {
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.delete({ type: 'del', key: 'Metric { timestamp: 1, value: 85 }'})
      stream.end()
    }
    public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
   const stream = this.db.createReadStream()
   var met: Metric[] = []

   stream.on('error', callback)
     .on('data', (data: any) => {
       const [_, k, timestamp] = data.key.split(":")
       const value = data.value
       if (key != k) {
         console.log(`LevelDB error: ${data} does not match key ${key}`)
       } else {
         met.push(new Metric(timestamp, value))
       }
     })
     .on('end', (err: Error) => {
       callback(null, met)
     })
 }
}
