'use client';

import { useRouter } from "next/navigation"
import React, { FormEvent, useState } from "react"



function Search() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  //e 의 타입을 모르겠다면, 사용할 곳에 e => 를 타이핑하여 e의 타입을 보면 된다.
  //이 경우 form의 onSubmit 에서 발생하는 이벤트이므로,
  //onSubmit = { e => handleSearch } 로 바꾸고 e 에 커서 대면 타입 나타남.
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch("");
    router.push(`/search/${search}`);
  }
  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={search}
        placeholder="Enter the Search term"
        onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">
          Search
        </button>
    </form>
  )
}

export default Search