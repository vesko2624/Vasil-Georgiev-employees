import {useEffect, useState} from "react";

const useFileReader = (file) => {
    const reader = new FileReader();
    const [content, setContent] = useState('');

    useEffect(() => {
        if(! (file instanceof Blob)) {
            return;
        }

        reader.onload = () => setContent(reader.result)
        reader.readAsText(file);

        return () => {
            reader.abort();
        }
    }, [file])

    return content;
}

export default useFileReader;