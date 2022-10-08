import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components'
import { isAddress } from '../../utils'


const InputPanel = styled.div<{ hideInput?: boolean }>`
  /* ${({ theme }) => theme.flexColumnNoWrap} */
  /* position: relative; */
  /* border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')}; */
  /* background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)}; */
  /* z-index: 1; */
  /* width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')}; */
  /* width: 404px; */
  /* height: 43px; */
  
`

const Container = styled.div<{ hideInput: boolean }>`
  /* border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')}; */
  /* border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)}; */
  /* background-color: ${({ theme }) => theme.bg1}; */
  /* width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')}; */
  /* :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  } */
`

const InputRow = styled.div<{ selected?: boolean }>`
  /* ${({ theme }) => theme.flexRowNoWrap} */
  /* align-items: center; */
  /* justify-content: space-between; */
  /* padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')}; */
`

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  /* color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  font-size: ${({ fontSize }) => fontSize ?? '18px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;
  text-align: left; */

  color: white;
  text-align: center;
  width: 402px;
  height: 41px;
  border-radius: 15px;
  border: 1px solid rgb(29, 103, 205);
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.3);

  :hover {
    background-color: #689ADE;
  };
  /* ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  } */;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 350px;
    grid-template-columns: 1fr 1fr;
    height: 54px;
  `};
`


export default function SourceAddress() {
  const { account, chainId } =useActiveWeb3React()
  return (
    <InputPanel>
      <Container hideInput={false}>
        <InputRow>
          <StyledInput
            disabled
            value={account??""}
            defaultValue={""}
          />
        </InputRow>
      </Container>
    </InputPanel>
  )
}
