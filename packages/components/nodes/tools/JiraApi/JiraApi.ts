import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'


class JiraAPI_Tools implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'Jira Ticket Pull'
        this.name = 'jiraTicketPull'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'jira.svg'
        this.category = 'Tools'
        this.description = 'Wrapper around Jira API'
        this.inputs = [
            {
                label: 'API Key',
                name: 'api_key',
                type: 'string'
            },
            {
                label: 'Ticket Number',
                name: 'ticket_num',
                type: 'string'
            },
            {
                label: 'Orginzation',
                name: 'org',
                type: 'string'
            }
        ]
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['jiraApi'],
            optional: true,
            hidden: true
        }
        this.baseClasses = [this.type, 'Tool']
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const selectedChatflowId = nodeData.inputs?.selectedChatflow as string
        const _name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const useQuestionFromChat = nodeData.inputs?.useQuestionFromChat as boolean
        const customInput = nodeData.inputs?.customInput as string

        const baseURL = (nodeData.inputs?.baseURL as string) || (options.baseURL as string)

        if (selectedChatflowId === options.chatflowid) throw new Error('Cannot call the same chatflow!')

        let headers = {}

        let toolInput = ''
        if (useQuestionFromChat) {
            //toolInput = input
        } else if (!customInput) {
            toolInput = customInput
        }

        let name = _name || 'jira_api_tool'

        let vector: any = []
        try {
            let res = await fetch('https://automateright.atlassian.net/rest/api/2/issue/ARW-18', {
                method: 'GET',
                headers: {
                  'Authorization': `Basic ${Buffer.from(
                    'XXXXX'
                  ).toString('base64')}`,
                  'Accept': 'application/json'
                }
            });

            let response = await res.json();

            let source = response.self;

            vector.push({
                pageContent: response?.fields?.issuetype?.name,
                metadata: {
                    source
                }
            })

            vector.push({
                pageContent: response?.fields?.project?.name,
                metadata: {
                    source
                }
            })

            vector.push({
                pageContent: response?.fields?.project?.projectTypeKey,
                metadata: {
                    source
                }
            })

            vector.push({
                pageContent: response?.fields?.assignee?.displayName,
                metadata: {
                    source
                }
            })

            vector.push({
                pageContent: response?.fields?.description,
                metadata: {
                    source
                }
            })

            vector.push({
                pageContent: response?.fields?.summary,
                metadata: {
                    source
                }
            })
        } catch (e) {
            vector = []
        }


        return vector
    }
}

module.exports = { nodeClass: JiraAPI_Tools }