
function PageHeading({currentPage}) {
  return (
    <h2 className='page-heading'>{currentPage.charAt(0).toUpperCase()+currentPage.slice(1)}</h2>
  )
}

export default PageHeading