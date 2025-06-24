FROM nginx:alpine

# Opcional: copio configuración custom de nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Copio todo el contenido del frontend
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]