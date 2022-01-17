import {NavLink} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

const REPOS_QUERY = `
{
  search(query: "query: is:public,name:*", type: REPOSITORY, first: 5) {
    repositoryCount
    pageInfo {
      endCursor
      startCursor
    }
    edges {
      node {
        ... on Repository {
        id
        name
        forkCount
        stargazers {
          totalCount
        }
        owner {
            login
          }
        }
      }
    }
  }
}
`

const Repos = () => {

    const [repos,setRepos] = useState([])
    const fetchRepos = async () =>{
        const response = await axios.post('https://api.github.com/graphql',{
            query: REPOS_QUERY
        },{headers:{Authorization:`Bearer ${process.env.REACT_APP_TOKEN}`}})
        const {data} = await response
        setRepos(data?.data?.search?.edges)
    }

    useEffect(()=>{
        fetchRepos().then(r => {}).catch(err => console.log(err))
    },[])

    if (!repos?.length) return 'Loading...'

    return(
        <main className='container'>
            <h1 className='py-5'>GitHub public repositories</h1>
            <div className="row">
                {repos.map((repo,id) => (
                    <div className="col-lg-4 col-md-6 col-12 mb-3" key={id}>
                        <NavLink to={`repo/${repo.node.id}`} className="card p-2 text-black text-decoration-none">
                            <h2 className="repo-name">{repo.node.name}</h2>
                            <h3 className='repo-owner'>made by "{repo.node.owner.login}"</h3>
                            <p className='repo-stars'>stars: {repo.node.stargazers.totalCount}</p>
                            <p className='repo-forks'>forks: {repo.node.forkCount}</p>
                        </NavLink>
                    </div>
                ))}

            </div>
        </main>
    )
}
export default Repos