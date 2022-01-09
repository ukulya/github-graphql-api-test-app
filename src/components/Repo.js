import {useParams} from "react-router";
import {useEffect, useState} from "react";
import { Tabs, Tab, Row, Col, Nav } from 'react-bootstrap';

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

    useEffect(()=>{
        fetch('https://api.github.com/graphql',{
            method:'POST',
            headers:{Authorization:`Bearer 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`},
            body: JSON.stringify({
                query:REPO_QUERY,
                variables: id
            })
        }).then(response => response.json())
            .then(data => {
                setRepo(data.data.node)
                setRepoName(data.data.node.name)
                setOwner(data.data.node.owner.login)
            })
            .then(()=>{

                // fetch repo files by repo name
                fetch('https://api.github.com/graphql',{
                    method:'POST',
                    headers:{Authorization:`Bearer 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`},
                    body: JSON.stringify({
                        query:REPO_FILES_QUERY,
                        variables: {repoName,id,owner}
                    })
                }).then(response => response.json())
                    .then(data => {
                        setBranches(data?.data?.repository?.refs?.edges)
                        console.log(data?.data?.repository?.refs?.edges)
                        for (let i = 0;i<data?.data?.repository?.refs?.edges.length;i++){
                            fetch('https://api.github.com/graphql',{
                                method:'POST',
                                headers:{Authorization:`Bearer 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`},
                                body: JSON.stringify({
                                    query:BRANCH_QUERY,
                                    variables: {repoName,id,owner,branchName:data?.data?.repository?.refs?.edges[i].node.name +':'}
                                })
                            }).then(response => response.json())
                                .then(data => {
                                    console.log('files',data)
                                    console.log(files)
                                    setFiles([...files,files.push(data.data.repository.object.entries)])
                                    //console.log(data?.data?.repository?.object?.entries)
                                })
                        }
                    })
            })
    },[repoName,owner])

    //if (!repo) return 'Loading...'
    //if (!branches.length) return 'Loading...'
    if (!files.length) return 'Loading...'


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
                                    <Nav.Link eventKey={`${id}branch`} name={branch.node.name}>{branch.node.name}</Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            {branches && branches.map((branch,id) => (
                                <Tab.Pane eventKey={`${id}branch`} key={id}>
                                    <p>{branch.node.name}</p>
                                    {/*{files.filter(file => (<div>{file.name}</div>))}*/}
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