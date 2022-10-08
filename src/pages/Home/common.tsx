import styled from 'styled-components'
export const Text = styled.div<{
    fontFamily?: string | null,
    fontSize?: string | null,
    fontWeight?: string | null,
    color?: string | null,
    width?: string | null,
    letterSpacing?: string | null,
}>`
  font-size: ${props => props.fontSize || "15px"};
  font-weight: ${props => props.fontWeight || "400"};
  font-family: montserrat;
  color:  ${props => props.color || "white"};
  opacity: 100%;
  line-height: ${props => Number(props.fontSize?.replaceAll("px", "")) + "px" || "20px"};

  letter-spacing: ${props => props.letterSpacing || "0.5px"};
  /* border: 3px solid; */
  /* border-color: green; */
  ${({ theme }) => theme.mediaWidth.upToMedium`
  `}
 
`

export const PText = styled(Text)`
    font-family: proximanova;
`

export const ReadMoreText = styled(Text)`
     color:  #C2C5CD;
`

export const Button = styled.a`
    display: flex;
    color: white;
    width: 145px;
    text-align: center;
    height: 35px;
    justify-content: center;
    justify-items: center;
    align-items: center;
    background-color:rgba(6,99,186, 0.8); 
    border-radius: 100px;
    text-decoration: none;
    
    z-index: 100;
    :hover{
        cursor: pointer;
        border: 1px solid;
        border-color: white;
        background-color: black;
    }
`