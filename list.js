import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export default function List() {

    const { navigate } = useNavigation();

    // Através de "useQueryClient" eu tenho acesso a funções para usar métodos de requisições como post, patch...
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery('todos', () => {
        console.log('de novo!');

        return axios.get('http://192.168.0.104:8080/todos').then((response) => {
            // Aqui eu estou retornando/colocando o array response.data para dentro da propriedade data do useQuery.
            return response.data
        });
    }, {
        // A opção retry no React Query é utilizada para especificar o número de tentativas que a biblioteca deve fazer ao executar automaticamente uma nova consulta (query) após uma falha.
        retry: 3,
        // "refetchOnWindowFocus": funciona aparentemente somente para web. Quando eu navego para uma outra janela e volto/foco para a janela que "tem esse código/essa requisição", é feito novamente uma requisição.
        //refetchOnWindowFocus: true, (padrão: false)

        // "refetchInterval": faz uma requisição a cada 5 segundos.
        // refetchInterval: 5000,

        // "initialData": é para quando você não quer usar o "isLoading", por exemplo. Ou seja, ao inves de mostra o "ActivityIndicator" enquando a requesição não é completada, você pode rederizar uma lista/dados inicial.
        //initialData: [{ id: '1', title: 'test' }]
    }
    );

    // Isso substitui o uso do "refetchOnWindowFocus" já que aparentemente "refetchOnWindowFocus" só funciona na web na navegação de janelas... todas as vezes que focar na tela 'Home' irá fazer uma nova requisição.
    // useFocusEffect(
    //     useCallback(() => {
    //         refetch();
    //     }, [])
    // );

    // getQueryData é uma função síncrona que pode ser usada para obter os dados armazenados em cache de uma consulta existente. Se a consulta não existir, será retornada.undefined
    
const data = queryClient.getQueryData(queryKey)

    const mutation = useMutation({
        mutationFn: ({ todosId, completed }) => {
            return axios.patch(`http://192.168.0.104:8080/todos/${todosId}`, { completed }).then((response) => response.data);
        },
        onSuccess: (data) => {
            // Quando der sucesso na requisição, que está sendo feita em "mutationFn", é 'preciso' usar um desses processos aqui em baixo: refetch() ou queryClient...; se eu usar "refetch": 
            //ao chamar refetch() em uma query do React Query, ela executará novamente a função fornecida para a query.Nesse caso, a função contém a chamada axios.get('http://192.168.0.104:8080/todos').Isso resultará em uma nova requisição HTTP usando axios.get para obter os dados da URL especificada.
            //refetch();

            // Ao usar `queryClient.setQueryData` no contexto do React Query, você está atualizando manualmente os dados na memória do cache da query sem disparar uma nova solicitação HTTP.
            queryClient.setQueryData('todos', (currentData) => currentData.map((item) => item.id === data.id ? data : item));
            // Para entender a difereça de refetch e setQueryData: escreva isso no facebook: 'diferença de refetch e setQueryData'.
        },
        onError: (error) => {
            console.log(error.message);
        }
    })

    // estado de loading/processo da requisição "mutation" aí em cima.
    //console.log(mutation.isLoading);

    // Essas condicionais devem ficar por ultimo senão pode dar erro. esse isLoading é referente a requisição get do useQuery.
    if (isLoading) {
        return <ActivityIndicator />
    }

    if (error) {
        console.log(error.message);

        return <>
            <Text>
                Algo deu errado...
            </Text>
        </>
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                contentContainerStyle={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                }}
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <Pressable

                            style={{
                                marginVertical: 5,
                                height: 80,
                                paddingHorizontal: 20,
                                justifyContent: 'center',
                                backgroundColor: item.completed ? 'green' : 'pink',
                            }}
                            onPress={() => {
                                mutation.mutate({ todosId: item.id, completed: !item.completed })
                            }}
                        // use com "useFocusEffect(
                        //     useCallback(() => {
                        //         refetch();
                        //     }, [])
                        // );" abilitado
                        // onPress={() => {
                        //     navigate('ListDetails');
                        // }}
                        >
                            {/* Como é uma requisição, demora um pouco para mudar a cor de background. Sendo assim é interessante usar uma lógica para que enquanto não muda a cor, faça algo... */}
                            {mutation.variables.todosId === item.id && mutation.isLoading ?
                                <ActivityIndicator />
                                :
                                <Text
                                    style={{
                                        fontSize: 18,
                                    }}
                                >
                                    {item.title}
                                </Text>
                            }
                        </Pressable>
                    )
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});



