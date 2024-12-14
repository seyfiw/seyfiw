import { useState, useEffect } from 'react';

export default function Clock(props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  return (
    <h2>
      It is {time.toLocaleTimeString()}.
    </h2>
  )
}
