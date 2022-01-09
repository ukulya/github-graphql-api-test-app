import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";
import axios from "axios";
const client = new ApolloClient({
    uri: 'https://48p1r2roz4.sse.codesandbox.io',
    cache: new InMemoryCache()
});

// const client = ...

client
    .query({
        query: gql`
      query GetRates {
        rates(currency: "USD") {
          currency
        }
      }
    `
    })
    .then(result => console.log(result));
const auth = {Authorization:`bearer ${process.env.token}`}
const githubUrl = 'https://api.github.com/graphql'

const gitClient = new ApolloClient({
    uri:githubUrl,
    headers:auth,
    cache: new InMemoryCache()
})

gitClient.query({
    query: gql`
    {
  search(query:"name:*", type:REPOSITORY, first:50){
        repositoryCount
        pageInfo{
            endCursor
            startCursor
        }
        edges{
            node{
                ... on Repository{
                    name
                }
            }
        }
    }
}

    `
}).then(result => console.log('gitClient',result?.data)).catch(e=>console.log(e));


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
