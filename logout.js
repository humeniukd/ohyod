export const handler = async (event) => {
    const state = event.queryStringParameters?.state ?? '';
    return {
        statusCode: 302,
        headers: {
            Location: `https://loudyo.com${state ? state : ''}`,
            "Set-Cookie": `token=deetedl; Domain=loudyo.com; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
    }
};
