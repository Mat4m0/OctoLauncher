# Static aria2c for the Linux AppImage (the Windows build bundles resources/aria2c.exe instead).
# Fully static (musl), so it runs on any x86_64 distro without extra libraries.
#   docker build --output type=local,dest=out Tools/linux/aria2c   ->  out/aria2c
#
# Sources are pinned by sha256.
# OpenSSL is built here rather than taken from Alpine: aria2 1.37 loads OpenSSL 3's "legacy" provider
# at startup (RC4, used for BitTorrent message-stream encryption) and aborts if it is missing. A static
# binary cannot load provider modules from disk, so OpenSSL is configured with no-module, which links
# the legacy provider into libcrypto.
FROM alpine:3.20 AS build
ARG OPENSSL_VERSION=3.5.9
ARG OPENSSL_SHA256=603f5602e2eef00d77fbd429d34dcd5822bb301757a1bc9cdb24c670f1eb859a
ARG ARIA2_VERSION=1.37.0
ARG ARIA2_SHA256=60a420ad7085eb616cb6e2bdf0a7206d68ff3d37fb5a956dc44242eb2f79b66b
ARG JOBS=2
RUN apk add --no-cache build-base pkgconf linux-headers perl curl xz \
      zlib-dev zlib-static c-ares-dev c-ares-static
WORKDIR /src
RUN curl -fsSLO "https://github.com/openssl/openssl/releases/download/openssl-${OPENSSL_VERSION}/openssl-${OPENSSL_VERSION}.tar.gz" \
 && echo "${OPENSSL_SHA256}  openssl-${OPENSSL_VERSION}.tar.gz" | sha256sum -c - \
 && tar xzf "openssl-${OPENSSL_VERSION}.tar.gz" \
 && cd "openssl-${OPENSSL_VERSION}" \
 && ./Configure linux-x86_64 no-shared no-module no-tests no-docs \
      --prefix=/opt/openssl --libdir=lib --openssldir=/etc/ssl \
 && make -j"${JOBS}" \
 && make install_sw
RUN curl -fsSLO "https://github.com/aria2/aria2/releases/download/release-${ARIA2_VERSION}/aria2-${ARIA2_VERSION}.tar.xz" \
 && echo "${ARIA2_SHA256}  aria2-${ARIA2_VERSION}.tar.xz" | sha256sum -c - \
 && tar xf "aria2-${ARIA2_VERSION}.tar.xz"
WORKDIR /src/aria2-${ARIA2_VERSION}
# The CA bundle path is only the compiled-in default (Debian/Ubuntu/Arch); the launcher passes
# --ca-certificate explicitly when the distro keeps its bundle elsewhere.
RUN PKG_CONFIG_PATH=/opt/openssl/lib/pkgconfig ./configure ARIA2_STATIC=yes \
      --with-openssl --without-gnutls --without-libnettle --without-libgmp --without-libgcrypt \
      --without-libxml2 --without-libexpat --without-sqlite3 --without-libssh2 \
      --with-libcares --with-libz --disable-nls \
      --with-ca-bundle=/etc/ssl/certs/ca-certificates.crt \
 && make -j"${JOBS}" \
 && strip src/aria2c \
 && ./src/aria2c --version | head -12
RUN cp "/src/aria2-${ARIA2_VERSION}/src/aria2c" /aria2c

FROM scratch AS out
COPY --from=build /aria2c /aria2c
