export const handler = async (event) => {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state ?? '';
    const clientId = '58li3blaoshaubsc66ovcds3rj';
    const redirectUri ='https://api.loudyo.com/login';

    /* global fetch */
    const res = await fetch(
        `https://a.loudyo.com/oauth2/token?grant_type=authorization_code&client_id=${clientId}&code=${code}&redirect_uri=${redirectUri}`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic NThsaTNibGFvc2hhdWJzYzY2b3ZjZHMzcmo6MWZna3BjaTdjc2piOXNvOGRzYXVyc2sybDhucWFkZ2t1NmVrMjBkbzY5c25sbHNoMnYydA=='
            }
        }
    );
    const data = await res.json();
    const expires = new Date(Date.now()+data.expires_in*1000);

    return {
        statusCode: 302,
        headers: {
            Location: `https://loudyo.com${state}`,
            "Set-Cookie": `token=${data.id_token}; Domain=loudyo.com; HttpOnly; Secure; expires=${expires.toUTCString()}`
        }
    }
};
