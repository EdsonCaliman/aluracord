import { Box, TextField, Button } from '@skynexui/components';
import React from 'react';
import { useRouter } from 'next/router';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import Header from '../src/components/Header';
import MessageList from '../src/components/MessageList';
import ButtonSendSticker from '../src/components/ButtonSendSticker';

const SUPBASE_URL = process.env.NEXT_PUBLIC_SUPBASE_URL;
const SUPBASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPBASE_ANON_KEY;
const supabaseClient = createClient(SUPBASE_URL, SUPBASE_ANON_KEY);

function listenRealTimeMessages(addMessage) {
    return supabaseClient
        .from('messages')
        .on('INSERT', (response) => {
            addMessage(response.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const routing = useRouter();
    const username = routing.query.username;
    const [message, setMessage] = React.useState('');
    const [listOfMessages, setListOfMessages] = React.useState([]);

    React.useEffect(() => {
        supabaseClient.from('messages').select('*').order('id', { ascending: false }).then(({ data }) => {
            setListOfMessages(data);
        });

        const subscription = listenRealTimeMessages((newMessage) => {
            setListOfMessages((updatedListOfMessages) => {
                return [
                    newMessage,
                    ...updatedListOfMessages,
                ]
            });
        });

        return () => {
            subscription.unsubscribe();
          }

    }, []);

    function handleNewMessage(novaMensagem) {
        if (novaMensagem === '')
            return;

        const message = {
            from: username,
            text: novaMensagem,
        };

        supabaseClient.from('messages').insert([message]).then();

        setMessage('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList messages={listOfMessages} />
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMessage(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                handleNewMessage(`:sticker: ${sticker}`);
                            }} />
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                marginLeft: '8px',
                            }}
                        >
                            <Button iconName="arrowRight"
                                variant='tertiary'
                                colorVariant='neutral'
                                styleSheet={{
                                    backgroundColor: appConfig.theme.colors.neutrals[900],
                                }}
                                onClick={() => {
                                    handleNewMessage(message);
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}