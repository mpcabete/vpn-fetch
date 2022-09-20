import { spawn, exec } from 'node:child_process'
import got, { OptionsInit } from 'got'
import path from 'path'
import chalk from 'chalk'
import { readdir } from 'fs/promises'
export class VpnGot {
  tableId?: string
  interface?: string
  constructor(private configFile: string, private loginFile: string) {}
  async getNewTableId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = `ip route show table all | \\
      grep "table" | \\
      sed 's/.*\\(table.*\\)/\\1/g' | \\
      awk '{print $2}' | \\
      sort | \\
      uniq | \\
      grep -e "[0-9]"`
      exec(command, (err, stdout) => {
        if (err) {
          console.log('err', err)
          resolve('10')
        }
        console.log('stdout', stdout)
        const existingIds = stdout
          .toString()
          .trim()
          .split('\n')
          .sort((a, b) => Number(a) - Number(b))
        const nextId = Number(existingIds[existingIds.length - 1]) + 10

        resolve(nextId.toString())
      })
    })
  }
  async connect() {
    return new Promise(async (resolve, reject) => {
      this.tableId = await this.getNewTableId()

      const ovpnClient = spawn(
        'sudo',
        [
          'openvpn',
          '--script-security',
          '2',
          '--route-noexec',
          `--route-up`,
          `'${path.resolve()}/route_up.sh`,
          `${this.tableId}'`,
          `--config`,
          `${this.configFile}`,
          `--auth-user-pass`,
          `${this.loginFile}`,
        ],
        { env: { TABLE_ID: this.tableId.toString() }, shell: true }
      )
      ovpnClient.stdout.on('data', (chunk) => {
        chunk
          .toString()
          .split('\n')
          .forEach((line: string) => {
            const data = line.trim()
            // console.log('data', data)
            if (data.toString().includes('[[network interface]]')) {
              this.interface = data.toString().split(':')[1]?.trim()
              console.log('data.toString()', data.toString())
              console.log(
                chalk.green(
                  `Sucessfully created VPN interface on ${this.interface}`
                )
              )
            }
            if (data.toString().includes('AUTH_FAILED')) {
              reject(new Error(`Auth failed for ${this.configFile}`))
            }
            if (data.toString().includes('Initialization Sequence Completed')) {
              console.log(chalk.green(data.toString().trim()))
              resolve(this)
            }
          })
      })

      ovpnClient.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
      })
      ovpnClient.on('error', (err) => {
        console.error('Error spawning ovpn:', err)
      })
      ovpnClient.on('close', (code) => {
        console.log('openvpn exited with code', code)
      })
    })
  }

  async get(url: string, opts?: OptionsInit): Promise<any> {
    if (!opts) {
      opts = {
        localAddress: this.interface,
      }
    } else {
      opts.localAddress = this.interface
    }
    console.log('opts',opts)
    return await got.get(url, opts)
  }
}

async function test() {
 const {body} = await got.get("https://api.nordvpn.com/v1/servers/recommendations?filters\[country_id\]=81&limit=3")
 const servers = JSON.parse(body)

   
  const configFiles = await readdir('/etc/openvpn/ovpn_tcp')

  const config = configFiles[Math.floor(Math.random() * configFiles.length)]
  console.log('config',config)
    const fex = new VpnGot(
      '/etc/openvpn/ovpn_tcp/' +
        config,
      './configs/overplay'
    )
    await fex.connect()
    const vpnsdata = await fex.get('https://ifconfig.me/ip')
    console.log('vpndata', vpnsdata.body)

  const config2 = configFiles[Math.floor(Math.random() * configFiles.length)]
  console.log('config2',config2)
    const fex2 = new VpnGot(
      '/etc/openvpn/ovpn_tcp/' +
        config2,
      './configs/overplay'
    )
    await fex2.connect()
    const vpnsdata2 = await fex2.get('https://ifconfig.me/ip')
    console.log('vpndata', vpnsdata2.body)

  const config3 = configFiles[Math.floor(Math.random() * configFiles.length)]
  console.log('config3',config3)
    const fex3 = new VpnGot(
      '/etc/openvpn/ovpn_tcp/' +
        config3,
      './configs/overplay'
    )
    await fex3.connect()
    const vpnsdata3 = await fex3.get('https://ifconfig.me/ip')
    console.log('vpndata', vpnsdata3.body)
}
if (true) {
  test()
}
