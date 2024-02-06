
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function Card({log, cardType, logNumber}) {
  const navigate = useNavigate();

  return (
    <div className='card' onClick={() => navigate(`/${cardType}/${log.id}`)}>
      {cardType === 'log' ?<p className='log-number'>No. {logNumber}</p> : <></>}
      <h3 className="card_heading">{log.data.location}</h3>
      <p className='card_date'>{moment.unix(log.data.date.seconds).format("YYYY-MM-DD")}</p>
    </div>
  )
}

export default Card