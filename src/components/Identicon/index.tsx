import Davatar from '@davatar/react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks/web3'

const StyledIdenticonContainer = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`

export default function Identicon() {
  const { account, library } = useActiveWeb3React()

  // console.log("Identicon->account", account)
  // console.log("Identicon->library", library)
  // if(library){
  //   console.log("Identicon->library.provider", library.provider)
  // }
  // console.log("Identicon->navigator.onLine", navigator.onLine)
  
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return (
    <StyledIdenticonContainer>
      
      {
        account &&
        library?.provider && 
        navigator.onLine &&
        <Davatar address={account} size={16} provider={library.provider} />
      }
    </StyledIdenticonContainer>
  )
}
