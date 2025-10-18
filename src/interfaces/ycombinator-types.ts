export type Startup = {
  id: number
  name: string
  website: string
  description: string
  VC_firm: "YCombinator" // literal type (only this value allowed)
  services: string | undefined
  former_names: string[]
  foundedAt: string
}