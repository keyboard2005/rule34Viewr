import axios from "axios";


export const getPostsApi = async (page, pageSize, tags) => {
    tags = tags.join("+");
    const response = await axios.get(`https://api.rule34.xxx/index.php?json=1&limit=${pageSize}&page=dapi&s=post&q=index&pid=${page}&tags=${tags}`);
    return response.data;
}


export const getTagInfoApi = async (tag) => {
    const response = await axios.get(`https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name=${tag}`);
    return response.data;
}