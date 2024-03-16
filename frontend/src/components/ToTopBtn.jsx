function ToTopBtn({ showBtn }) {
  const scrollToTop = (e) => {
    e.target.parentElement.parentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  return (
    <>
      <div onClick={(e)=>scrollToTop(e)} className={`to-top-btn ${showBtn && "to-top-btn_show"}`}></div>
    </>
  )
}

export default ToTopBtn