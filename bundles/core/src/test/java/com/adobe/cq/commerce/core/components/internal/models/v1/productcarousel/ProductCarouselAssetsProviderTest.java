/*******************************************************************************
 *
 *    Copyright 2020 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/
package com.adobe.cq.commerce.core.components.internal.models.v1.productcarousel;

import java.util.ArrayList;
import java.util.List;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.Mockito;

import com.adobe.cq.commerce.core.components.internal.models.v1.AssetsProvider;
import com.adobe.cq.commerce.core.components.services.ComponentsConfiguration;
import com.adobe.cq.commerce.core.components.testing.Utils;
import com.adobe.cq.commerce.graphql.client.GraphqlClient;
import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import io.wcm.testing.mock.aem.junit.AemContext;
import io.wcm.testing.mock.aem.junit.AemContextCallback;

public class ProductCarouselAssetsProviderTest {

    private static final String PRODUCTCAROUSEL = "/content/pageA/jcr:content/root/responsivegrid/productcarousel";
    private static final String PRODUCT = "/content/pageA/jcr:content/root/responsivegrid/product";

    @Rule
    public final AemContext context = createContext("/context/jcr-content.json");

    private static final ValueMap MOCK_CONFIGURATION = new ValueMapDecorator(
        ImmutableMap.of("cq:graphqlClient", "default", "magentoStore", "my-store"));
    private static final ComponentsConfiguration MOCK_CONFIGURATION_OBJECT = new ComponentsConfiguration(MOCK_CONFIGURATION);

    private final AssetsProvider productCarouselAssetsProvider = new ProductCarouselAssetsProvider();

    private Resource carouselResource;

    private static AemContext createContext(String contentPath) {
        return new AemContext(
            (AemContextCallback) context -> {
                // Load page structure
                context.load().json(contentPath, "/content");
            },
            ResourceResolverType.JCR_MOCK);
    }

    @Before
    public void setup() throws Exception {
        carouselResource = Mockito.spy(context.resourceResolver().getResource(PRODUCTCAROUSEL));
        context.currentResource(carouselResource);
        Mockito.when(carouselResource.adaptTo(ComponentsConfiguration.class)).thenReturn(MOCK_CONFIGURATION_OBJECT);

        GraphqlClient graphqlClient = Utils.setupGraphqlClientWithHttpResponseFrom("graphql/magento-graphql-productcarousel-result.json");
        context.registerAdapter(Resource.class, GraphqlClient.class, (Function<Resource, GraphqlClient>) input -> input.getValueMap().get(
            "cq:graphqlClient") != null ? graphqlClient : null);
    }

    @Test
    public void testCanHandle() {
        Assert.assertTrue("Expected resource not handled", productCarouselAssetsProvider.canHandle(carouselResource));

        Resource productResource = context.resourceResolver().getResource(PRODUCT);
        Assert.assertFalse("Unexpected resource handled", productCarouselAssetsProvider.canHandle(productResource));
    }

    @Test
    public void testAddAssetPaths() {
        List<String> assets = new ArrayList<>();
        productCarouselAssetsProvider.addAssetPaths(carouselResource, assets);
        Assert.assertEquals("Wrong number of assets returned", 2, assets.size());
        Assert.assertTrue("Wrong asset path returned", assets.contains("/content/dam/watch-image.jpg"));
        Assert.assertTrue("Wrong asset path returned", assets.contains("/content/dam/summit-kit-image.jpg"));
    }
}