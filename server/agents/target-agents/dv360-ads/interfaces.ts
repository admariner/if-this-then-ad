export interface AgentResult  {
    agentId: string,
    jobId: string,
    agentName: string,
    timestamp: Date,
    success: boolean,
}

export interface IAgent {
    agentId: string,
    name: string,
    execute(task: AgentTask): Promise<Array<ActionResult>>
}

export interface RuleResult {
    ruleId: string,
    result: boolean | number, 
    actions: Array<TargetAction>
}

export interface actionParam {
    key: string,
    value: string | number | boolean
}

export interface TargetAction {
    action: string,
    params: Array<actionParam>
}

export interface AgentOptions {
    key: string,
    value: string|number|boolean,
}

export interface TargetAgent {
    id: string,
    actions: Array<TargetAction>
}

export interface Tokens {
    refresh?: string,
    auth: string,
}

export interface AgentTask {
    tokens: Tokens,
    ruleResult: RuleResult,
}

export enum EntityActions {
    ACTIVATE = 'activate',
    PAUSE = 'pause',
}

// Whatever we get from the client
export enum EntityType {
    LI = 'LI',
    IO = 'IO'
}

export enum EntityStatus {
    ACTIVATE = 'ENTITY_STATUS_ACTIVE',
    PAUSE = 'ENTITY_STATUS_PAUSED'
}

export interface InstanceOptions {
    entityType: string,
    advertiserId?: number,
    entityId?: number,
    action?: string,
}

export interface ActionResult {
    ruleId: string,
    action: string,
    displayName: string,
    entityStatus: string,
    timestamp: Date,
    success: boolean,
    error: string,
}

export interface DV360ApiClientOptions {
    authToken: string,
    baseUrl: string,
}

export enum httpMethods {
    PATCH = 'PATCH',
}

export interface DV360ApiCallOptions {
    httpMethod: httpMethods,
    url: string,
    data: Object,
}