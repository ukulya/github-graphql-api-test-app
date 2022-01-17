import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {Tabs, Tab, Row, Col, Nav, Accordion} from 'react-bootstrap';
import axios from "axios";

const Repo = () => {
    const id = useParams()
    const REPO_QUERY = `
query repository($id: ID!){ 
    node(id: $id){
    ... on Repository {
      id
      name
      owner {
        login
      }
    }
  }
}
`;
    const REPO_FILES_QUERY = `
     query getExistingRepoBranches($repoName: String!,$owner:String!) {
  repository(name: $repoName, owner: $owner) {
    id
    name
    refs(refPrefix: "refs/heads/", first: 10) {
      edges {
        node {
          name
        }
      }
      pageInfo {
        endCursor
      }
    }
  }
}

`;

    const BRANCH_QUERY = `
    query getExistingRepoBranches($branch: GitObjectID,$repoName: String!,$owner:String!,$branchName: String!) {
  repository(name: $repoName, owner: $owner) {
    object(oid: $branch, expression: $branchName) {
      ... on Tree {
        entries {
          name
          object {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
    `

    const [repo,setRepo] = useState({})
    const [branches,setBranches] = useState([])
    const [files,setFiles] = useState([])
    const [repoName,setRepoName] = useState('')
    const [owner,setOwner] = useState('')

    const fetchRepo = async () => {
        const response = await axios.post('https://api.github.com/graphql',{
            query: REPO_QUERY,
            variables: id
        },{headers:{Authorization:`Bearer ${process.env.REACT_APP_TOKEN}`}})
        const {data} = await response
        setRepo(data.data.node)
        setRepoName(data.data.node.name)
        setOwner(data.data.node.owner.login)
    }

    const fetchBranches = async () => {
        const response = await axios.post('https://api.github.com/graphql',{
            query: REPO_FILES_QUERY,
            variables: {repoName,id,owner}
        },{headers:{Authorization:`Bearer ${process.env.REACT_APP_TOKEN}`}})
        const {data} = await response
        setBranches(data?.data?.repository?.refs?.edges)
        //console.log('branches', data?.data?.repository?.refs?.edges)
    }

    const fetchFiles = async (branchName) => {
        const response = await axios.post('https://api.github.com/graphql',{
            query: BRANCH_QUERY,
            variables: {repoName, id, owner, branchName:branchName + ':' }
        },{headers:{Authorization:`Bearer ${process.env.REACT_APP_TOKEN}`}})
        const {data} = await response
        setFiles(data.data.repository.object.entries)
        console.log('files', data.data.repository.object.entries)
    }

    useEffect(()=>{
        fetchRepo().then(r => {}).catch(err => console.log(err))
        fetchBranches().then(r => {}).catch(err => console.log(err))

    },[repoName,owner])

    const handleClick = (branchName) => {
        fetchFiles(branchName).then(r => {}).catch(err => console.log(err))
    }

    if (!branches?.length) return 'Loading...'

    return(
        <div className='container'>
            <h1 className='py-5'>{repo.name}</h1>
            <h2 className='pb-5'>Branches</h2>
            <Tab.Container defaultActiveKey="0branch">
                <Row>
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            {branches && branches.map((branch,id) => (
                                <Nav.Item key={id} >
                                    <Nav.Link eventKey={`${id}branch`} name={branch.node.name} onClick={()=>{handleClick(branch.node.name)}}>{branch.node.name}</Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            {branches && branches.map((branch,id) => (
                                <Tab.Pane eventKey={`${id}branch`} key={id}>
                                    <p>{branch.node.name}</p>
                                        <Accordion defaultActiveKey="0file">
                                            {files.map((file,fileId) => (
                                            <Accordion.Item eventKey={`${fileId}file`}>
                                                <Accordion.Header>{file.name}</Accordion.Header>
                                                <Accordion.Body>
                                                    {file.object.text}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                            ))}
                                        </Accordion>
                                </Tab.Pane>
                            ))}
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    )
}
export default Repo