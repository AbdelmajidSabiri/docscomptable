import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const refetch = () => setShouldRefetch(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      setLoading(true);
      
      try {
        const response = await axios({
          cancelToken: source.token,
          ...options,
          url,
        });
        
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data || 'An error occurred');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      source.cancel('Component unmounted');
    };
  }, [url, shouldRefetch, JSON.stringify(options)]);

  return { data, loading, error, refetch };
};

export default useFetch;