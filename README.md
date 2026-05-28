# Smartcampus Flora e Funga 🌿

O **Smartcampus Flora e Funga** é um aplicativo mobile desenvolvido para o mapeamento, registro e consulta de espécies biológicas. O projeto permite a geolocalização de instâncias de plantas e fungos, facilitando a catalogação e o acesso à informação taxonômica detalhada de forma interativa.

## 📸 Demonstração

<div align="center">
  <img  src="https://github.com/user-attachments/assets/4210e0ff-9d23-49aa-a8dc-f760066995f2" alt="Mapa de visualização" width="30%" height='550'>
  <img src="https://github.com/user-attachments/assets/e117a1c1-b89e-4034-8dd0-1d7ad9edea4d" alt="Tela de registro de espécime" width="30%" height='550'>
  <img  src="https://github.com/user-attachments/assets/09d92fc2-9a45-45fb-925d-8defce735b97" alt="Detalhes da instância" width="30%" height='550'>
</div>

## ✨ Funcionalidades

* **Mapeamento em Tempo Real:** Visualização de espécimes registrados no mapa (com integração de localização do usuário).
* **Registro de Instâncias:** Formulário para adicionar novos espécimes, incluindo quem registrou, detalhes da observação e busca inteligente da espécie.
* **Busca Otimizada:** Autocomplete rápido e eficiente para encontrar a taxonomia correta da espécie durante o registro.
* **Detalhes Botânicos:** Cards informativos com a classificação taxonômica completa (Reino, Família, Gênero) e nomes populares.
* **Integração com Bases Externas:** Link direto para a ficha da espécie no sistema Reflora.

## 🚀 Tecnologias Utilizadas

**Front-end (Mobile):**
* **[React Native](https://reactnative.dev/):** Framework para o desenvolvimento da interface e lógica do aplicativo.
* **[Expo](https://expo.dev/)**: Ferramenta para facilitar o build, testes e execução do app.
* **Mapas:** Integração para a renderização dos pinos de geolocalização.

**Back-end & Banco de Dados:**
* **[Node.js](https://nodejs.org/):** Ambiente de execução utilizado para construir a API RESTful que alimenta o aplicativo.
* **[Elasticsearch](https://www.elastic.co/):** Motor de busca utilizado para indexar e realizar consultas rápidas e textuais no catálogo complexo de espécies taxonômicas.
