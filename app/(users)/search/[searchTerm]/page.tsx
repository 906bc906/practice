import React from 'react'
type PageProps = {
  params: {
    searchTerm: string;
  }
}

type SearchResult = {
  organic_results: [
    {
      position: number;
      title: string;
      link: string;
      thumbnail: string;
      snippet: string;
    }
  ]
}

const search = async (searchTerm: string) => {
  const res = await fetch(
    `https://serpapi.com/search.json?q=${searchTerm}&api_key=${process.env.API_KEY}`
  );

  //loading 컴포넌트를 사용함.
  //dev 모드에서는 추가적으로 오류창을 띄움.
  //throw new Error("Whoops something broke")

  const data: SearchResult = await res.json();
  return data;
}

async function SearchResults({ params: {searchTerm }}: PageProps) {
  const searchResults = await search(searchTerm);
  return (
    <div>
      <p className="text-gray-500 text-sm">You searched for: {searchTerm}</p>

      <ol className="space-y-5 p-5">
        {searchResults.organic_results.map((result) => (
          <li className="list-decimal" key={result.position}>
            <p className="font-bold">{result.title}</p>
            <p>{result.snippet}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default SearchResults